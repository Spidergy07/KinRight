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
  "recommendedDishes": [
    {
      "type": "customizable | simple",
      "dish": "suggested dish in English",
      "thaiDish": "ชื่อเมนูภาษาไทย",
      "steps": [{"step": "step name", "options": ["option1", "option2"]}],
      "options": ["standard order"],
      "safetyWarnings": ["short warning"]
    }
  ],
  "orderInterface": {
    "type": "customizable | simple",
    "dish": "detected dish in English",
    "thaiDish": "ชื่อเมนูภาษาไทย",
    "steps": [{"step": "step name", "thaiStep": "ชื่อขั้นตอนภาษาไทย", "options": [{"label": "option in English", "thai": "ตัวเลือกภาษาไทย"}]}],
    "options": [{"label": "standard order", "thai": "ประโยคสั่งภาษาไทย"}],
    "safetyWarnings": ["short warning"],
    "suggestedThaiOrderTemplate": "Thai order template using choices"
  },
  "safeToOrder": false
}`;

const getTravelerInstructions = profile =>
  typeof profile?.instructions === 'string' ? profile.instructions.trim() : '';

const buildPrompt = profile => {
  const travelerInstructions = getTravelerInstructions(profile);

  return `You are an AI Food Ordering Assistant designed for tourists ordering street food.

Your task is to analyze the given visual context from an image of a food stall, menu, or food item and generate a structured ordering interface.

-------------------------
INPUT:
1. Visual context from the uploaded image:
   - what the stall sells
   - visible menu text
   - detected food items and likely ingredients
2. User profile as plain text:
   - allergies, dietary restrictions, and spice tolerance

System profile instruction from the traveler:
${travelerInstructions || '(none)'}

Traveler profile:
${JSON.stringify(profile || {}, null, 2)}

-------------------------
GOAL:

Determine whether the food requires customization or not.

- If the food has multiple components or ordering steps, such as noodles, som tam, curry, or pad thai:
  Generate structured choices in orderInterface.steps.

- If the food is simple or has no normal customization, such as sausage, grilled skewers, or fried snacks:
  Do not generate choices.
  Return a simple order option in orderInterface.options.

-------------------------
KNOWN APP DISH IDS:

- noodles: noodle soup / ก๋วยเตี๋ยว
- somtum: papaya salad / ส้มตำ
- padthai: pad thai / ผัดไทย
- unknown: use this if not confident

-------------------------
OUTPUT FORMAT:

Return JSON only. No markdown. Use this exact shape:
${foodSchemaHint}

-------------------------
RULES:

1. Safety is the highest priority.
2. NEVER include options that violate the user's constraints:
   - Remove ingredients that conflict with allergies.
   - Respect dietary rules strictly.
   - Adjust spice options based on tolerance.
3. If uncertainty exists:
   - Provide best guess but keep options simple.
   - If image is unclear, use dishId "unknown" and confidence below 0.5.
4. Keep orderInterface minimal and intuitive, max 3-4 steps.
5. Focus on how Thai street food is actually ordered, not literal translation.
6. Generate recommendedDishes as structured menu suggestions when the detected food is unknown, not directly supported by the app, or when useful similar menu choices are visible.
7. Each recommendedDishes item must follow one of these formats:
   Customizable food:
   {
     "type": "customizable",
     "dish": "<detected or suggested dish>",
     "thaiDish": "<Thai dish name>",
     "steps": [
       {"step": "<step name>", "options": ["option1", "option2"]}
     ],
     "options": [],
     "safetyWarnings": []
   }
   Simple food:
   {
     "type": "simple",
     "dish": "<detected or suggested item>",
     "thaiDish": "<Thai item name>",
     "steps": [],
     "options": ["standard order"],
     "safetyWarnings": []
   }
8. For recommendedDishes, prioritize realistic Thai street food ordering and remove anything unsafe for the user.
9. suggestedQuestions must contain short questions the tourist can ask the vendor when safety or ingredients are uncertain.
10. thaiOrderSuggestion must be natural Thai text usable to show a vendor.
11. confidence must be 0 to 1.
12. If the image looks like a menu, include visible menu text in detectedText.`;
};

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
