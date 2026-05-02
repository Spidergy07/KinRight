import { env } from '../config/env.js';

let nextKeyIndex = 0;
let nextTtsKeyIndex = 0;

const geminiEndpoint = model =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

const PCM_SAMPLE_RATE = 24000;
const PCM_CHANNELS = 1;
const PCM_BITS_PER_SAMPLE = 16;

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

  return `Analyze this Thai street food/menu image for a tourist ordering safely.

Traveler profile: ${travelerInstructions || 'none'}

Return JSON only:
${foodSchemaHint}

RULES:
1. Safety first. Never include options that violate allergy/diet/spice constraints.
2. Keep it concise. Max 3 order steps, max 4 options per step, max 3 recommendedDishes.
3. Use practical Thai street-food ordering, not literal translation.
4. If unclear, use dishId "unknown" and confidence below 0.5.
5. thaiOrderSuggestion must be natural Thai text usable to show a vendor.
6. recommendedDishes should be realistic similar items only when useful.`;
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

const extractInlineAudio = data => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.find(part => part.inlineData?.data || part.inline_data?.data)?.inlineData?.data ||
    parts.find(part => part.inlineData?.data || part.inline_data?.data)?.inline_data?.data ||
    '';
};

const pcmToWav = pcmBuffer => {
  const byteRate = (PCM_SAMPLE_RATE * PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const blockAlign = (PCM_CHANNELS * PCM_BITS_PER_SAMPLE) / 8;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(PCM_CHANNELS, 22);
  header.writeUInt32LE(PCM_SAMPLE_RATE, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(PCM_BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
};

export const generateSpeechWithGemini = async ({ text }) => {
  const speechText = String(text || '').trim();

  if (!speechText) {
    throw new Error('text is required.');
  }

  if (!env.gemini.apiKeys.length) {
    throw new Error('At least one GEMINI_API_KEY_1..5 value is required.');
  }

  const attemptsLimit = Math.min(env.gemini.maxRetries, env.gemini.apiKeys.length);
  const startedAtIndex = nextTtsKeyIndex;
  const attempts = [];

  for (let attemptNumber = 0; attemptNumber < attemptsLimit; attemptNumber += 1) {
    const keyIndex = (startedAtIndex + attemptNumber) % env.gemini.apiKeys.length;
    const apiKey = env.gemini.apiKeys[keyIndex];

    try {
      const response = await fetch(geminiEndpoint(env.gemini.ttsModel), {
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
                  text: `Say clearly in Thai, at a natural street-food ordering pace. Speak only this order: ${speechText}`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: env.gemini.ttsVoice
                }
              }
            }
          },
          model: env.gemini.ttsModel
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error?.message || `Gemini TTS request failed with HTTP ${response.status}`;
        attempts.push({ keyIndex: keyIndex + 1, status: response.status, message });

        const error = new Error(message);
        error.retryable = shouldRotateKey(response.status);
        error.logged = true;
        throw error;
      }

      const audioBase64 = extractInlineAudio(data);
      if (!audioBase64) {
        throw new Error('Gemini TTS returned empty audio.');
      }

      nextTtsKeyIndex = (keyIndex + 1) % env.gemini.apiKeys.length;

      return {
        audio: pcmToWav(Buffer.from(audioBase64, 'base64')),
        mimeType: 'audio/wav',
        model: env.gemini.ttsModel,
        keyIndex: keyIndex + 1,
        attempts: attempts.length + 1
      };
    } catch (error) {
      if (!error.logged) {
        attempts.push({ keyIndex: keyIndex + 1, message: error.message });
      }

      if (!error.retryable || attemptNumber >= attemptsLimit - 1) {
        const details = attempts.map(item => `key ${item.keyIndex}: ${item.message}`).join('; ');
        throw new Error(`Gemini TTS failed after ${attempts.length} attempt(s). ${details}`);
      }
    }
  }

  throw new Error('Gemini TTS failed.');
};

export const analyzeImageWithGemini = async ({ file, profile }) => {
  if (!env.gemini.apiKeys.length) {
    throw new Error('At least one GEMINI_API_KEY_1..5 value is required.');
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
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1200,
            responseMimeType: 'application/json'
          },
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
