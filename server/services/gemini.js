import { env } from '../config/env.js';

let nextKeyIndex = 0;

const geminiEndpoint = model =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

const foodSchemaHint = `{
  "dishId": "noodles | somtum | padthai | unknown",
  "dishName": "English dish name",
  "thaiName": "Thai dish name if visible or likely",
  "confidence": 0.0,
  "detectedText": ["menu text or signs visible in the image"],
  "likelyIngredients": ["ingredient"],
  "allergyRisks": [{"name":"peanut|seafood|gluten|other","confidence":0.0,"reason":"short reason"}],
  "dietaryRisks": [{"type":"vegan|halal|other","confidence":0.0,"reason":"short reason"}],
  "suggestedQuestions": ["short question a traveler should ask vendor"],
  "thaiOrderSuggestion": "natural Thai order sentence",
  "englishSummary": "short English summary",
  "safeToOrder": false
}`;

const buildPrompt = profile => `You are an assistant for foreign travelers ordering Thai street food.
Analyze this image of Thai food, a menu, or a street food stall.

Known app dish IDs:
- noodles: noodle soup / ก๋วยเตี๋ยว
- somtum: papaya salad / ส้มตำ
- padthai: pad thai / ผัดไทย
- unknown: use this if not confident

Traveler profile:
${JSON.stringify(profile || {}, null, 2)}

Return JSON only. No markdown. Use this exact shape:
${foodSchemaHint}

Rules:
- confidence must be 0 to 1.
- If image is unclear, use dishId "unknown" and confidence below 0.5.
- Be conservative with allergy and dietary risks.
- thaiOrderSuggestion should be usable to show a vendor.
- If the image looks like a menu, include visible menu text in detectedText.`;

const extractText = data => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map(part => part.text).filter(Boolean).join('\n').trim();
};

export const parseGeminiJson = text => {
  if (!text) throw new Error('Gemini returned empty text.');

  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const jsonText = firstBrace >= 0 && lastBrace >= firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned;

  return JSON.parse(jsonText);
};

const shouldRotateKey = status => [401, 403, 429, 500, 502, 503, 504].includes(status);

export const analyzeImageWithGemini = async ({ file, profile }) => {
  if (!env.gemini.apiKeys.length) {
    throw new Error('At least one GEMINI_API_KEY_1..4 value is required.');
  }

  const attemptsLimit = Math.min(env.gemini.maxRetries, env.gemini.apiKeys.length);
  const startedAtIndex = nextKeyIndex;
  const attempts = [];

  for (let attemptNumber = 0; attemptNumber < attemptsLimit; attemptNumber += 1) {
    const keyIndex = (startedAtIndex + attemptNumber) % env.gemini.apiKeys.length;
    const apiKey = env.gemini.apiKeys[keyIndex];

    try {
      const response = await fetch(geminiEndpoint(env.gemini.model), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: file.mimetype,
                    data: file.buffer.toString('base64')
                  }
                },
                { text: buildPrompt(profile) }
              ]
            }
          ]
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error?.message || `Gemini request failed with HTTP ${response.status}`;
        attempts.push({ keyIndex: keyIndex + 1, status: response.status, message });

        const error = new Error(message);
        error.retryable = shouldRotateKey(response.status);
        error.logged = true;
        throw error;
      }

      const rawText = extractText(data);
      const result = parseGeminiJson(rawText);
      nextKeyIndex = (keyIndex + 1) % env.gemini.apiKeys.length;

      return {
        result,
        rawText,
        model: env.gemini.model,
        keyIndex: keyIndex + 1,
        attempts: attempts.length + 1
      };
    } catch (error) {
      if (!error.logged) {
        attempts.push({ keyIndex: keyIndex + 1, message: error.message });
      }

      if (!error.retryable || attemptNumber >= attemptsLimit - 1) {
        const details = attempts.map(item => `key ${item.keyIndex}: ${item.message}`).join('; ');
        throw new Error(`Gemini analysis failed after ${attempts.length} attempt(s). ${details}`);
      }
    }
  }

  throw new Error('Gemini analysis failed.');
};
