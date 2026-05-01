import express from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import { deleteCloudinaryImage, uploadImageBuffer } from '../services/cloudinaryUpload.js';
import { analyzeImageWithGemini } from '../services/gemini.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxUploadMb * 1024 * 1024,
    files: 1
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype?.startsWith('image/')) {
      callback(new Error('Only image uploads are supported.'));
      return;
    }

    callback(null, true);
  }
});

const parseProfile = value => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('profile must be valid JSON.');
  }
};

const normalizeStrings = value =>
  Array.isArray(value)
    ? [...new Set(value.map(item => String(item || '').trim()).filter(Boolean))].slice(0, 12)
    : [];

const normalizeRisks = value => {
  if (!Array.isArray(value)) return [];

  const seen = new Set();

  return value
    .map(item => ({
      name: String(item?.name || item?.type || 'other').trim().toLowerCase(),
      type: item?.type ? String(item.type).trim().toLowerCase() : undefined,
      confidence: Number(item?.confidence) || 0,
      reason: String(item?.reason || '').trim()
    }))
    .filter(item => {
      if (!item.name) return false;

      const key = `${item.name}:${item.type || ''}:${item.reason}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
};

const normalizeRecommendedDishes = value => {
  if (!Array.isArray(value)) return [];

  const seen = new Set();

  return value
    .map(item => ({
      name: String(item?.name || '').trim(),
      thai: String(item?.thai || '').trim(),
      sharedIngredients: normalizeStrings(item?.sharedIngredients).slice(0, 6),
      reason: String(item?.reason || '').trim()
    }))
    .filter(item => {
      if (!item.name && !item.thai) return false;

      const key = `${item.name}:${item.thai}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
};

const mergeRisks = value => {
  const merged = new Map();

  normalizeRisks(value).forEach(risk => {
    const key = `${risk.type || ''}:${risk.name}`;
    const existing = merged.get(key);

    if (!existing || risk.confidence >= existing.confidence) {
      merged.set(key, risk);
    }
  });

  return [...merged.values()].slice(0, 8);
};

const hasAny = (value, patterns) => patterns.some(pattern => pattern.test(value));

const getProfileInstructions = profile =>
  typeof profile?.instructions === 'string' ? profile.instructions.trim() : '';

const deriveTextConstraints = profile => {
  const instructions = getProfileInstructions(profile).toLowerCase();
  const allergyContext = /แพ้|allerg|avoid|no |ไม่กิน|ห้าม|can't|cannot/i.test(instructions);

  return {
    instructions,
    allergies: {
      peanut: allergyContext && hasAny(instructions, [/ถั่ว/i, /peanut/i]),
      seafood:
        allergyContext &&
        hasAny(instructions, [/กุ้ง/i, /ปู/i, /หอย/i, /อาหารทะเล/i, /shrimp/i, /prawn/i, /crab/i, /shellfish/i, /seafood/i]),
      gluten: allergyContext && hasAny(instructions, [/กลูเตน/i, /แป้งสาลี/i, /wheat/i, /gluten/i])
    },
    dietary: {
      vegan: hasAny(instructions, [/มังสวิรัติ/i, /กินเจ/i, /vegan/i, /vegetarian/i]),
      halal: hasAny(instructions, [/ฮาลาล/i, /halal/i, /ไม่กินหมู/i, /ไม่เอาหมู/i, /no pork/i])
    },
    spice: {
      none: hasAny(instructions, [/ไม่เผ็ดเลย/i, /ไม่เผ็ด/i, /no chili/i, /no spice/i, /not spicy/i]),
      mild: hasAny(instructions, [/เผ็ดไม่มาก/i, /เผ็ดน้อย/i, /เผ็ดนิด/i, /less spicy/i, /mild/i])
    }
  };
};

const profileAllergyRisks = constraints => {
  const risks = [];

  if (constraints.allergies.peanut) {
    risks.push({ name: 'peanut', confidence: 1, reason: 'Traveler profile says to avoid peanut.' });
  }
  if (constraints.allergies.seafood) {
    risks.push({ name: 'seafood', confidence: 1, reason: 'Traveler profile says to avoid seafood or shellfish.' });
  }
  if (constraints.allergies.gluten) {
    risks.push({ name: 'gluten', confidence: 1, reason: 'Traveler profile says to avoid wheat or gluten.' });
  }

  return risks;
};

const profileDietaryRisks = constraints => {
  const risks = [];

  if (constraints.dietary.vegan) {
    risks.push({ type: 'vegan', confidence: 1, reason: 'Traveler profile asks for vegetarian or vegan food.' });
  }
  if (constraints.dietary.halal) {
    risks.push({ type: 'halal', confidence: 1, reason: 'Traveler profile asks to avoid pork or eat halal.' });
  }

  return risks;
};

const profileQuestions = constraints => {
  const questions = [];

  if (constraints.allergies.peanut) questions.push('มีถั่วหรือซอสถั่วไหมครับ/คะ?');
  if (constraints.allergies.seafood) questions.push('มีอาหารทะเล กุ้ง ปู หรือหอยไหมครับ/คะ?');
  if (constraints.allergies.gluten) questions.push('มีแป้งสาลีหรือกลูเตนไหมครับ/คะ?');
  if (constraints.dietary.vegan) questions.push('ทำแบบมังสวิรัติ ไม่ใส่เนื้อสัตว์และน้ำปลาได้ไหมครับ/คะ?');
  if (constraints.dietary.halal) questions.push('มีหมูหรือส่วนผสมจากหมูไหมครับ/คะ?');
  if (constraints.spice.none) questions.push('ทำไม่เผ็ดเลยได้ไหมครับ/คะ?');
  else if (constraints.spice.mild) questions.push('ทำเผ็ดน้อยได้ไหมครับ/คะ?');

  return questions;
};

const thaiSafetyPhrases = constraints => {
  const phrases = [];

  if (constraints.allergies.peanut) phrases.push('ไม่ใส่ถั่ว');
  if (constraints.allergies.seafood) phrases.push('ไม่ใส่กุ้งหรืออาหารทะเล');
  if (constraints.allergies.gluten) phrases.push('ไม่ใส่แป้งสาลีหรือกลูเตน');
  if (constraints.dietary.vegan) phrases.push('มังสวิรัติ ไม่ใส่เนื้อสัตว์และน้ำปลา');
  if (constraints.dietary.halal) phrases.push('ไม่ใส่หมู');
  if (constraints.spice.none) phrases.push('ไม่เผ็ดเลย');
  else if (constraints.spice.mild) phrases.push('เผ็ดน้อย');

  return phrases;
};

const containsUnsafePositiveAllergen = (suggestion, constraints) => {
  const text = String(suggestion || '').toLowerCase();

  if (!text) return false;

  const unsafeMatchers = [
    constraints.allergies.peanut && { words: [/ถั่ว/i, /peanut/i], safe: /ไม่ใส่ถั่ว|ห้ามใส่ถั่ว|no peanut|without peanut/i },
    constraints.allergies.seafood && {
      words: [/กุ้ง/i, /ปู/i, /หอย/i, /อาหารทะเล/i, /shrimp/i, /prawn/i, /crab/i, /shellfish/i, /seafood/i],
      safe: /ไม่ใส่กุ้ง|ไม่ใส่อาหารทะเล|ห้ามใส่กุ้ง|ห้ามใส่อาหารทะเล|no seafood|no shrimp|without seafood|without shrimp/i
    },
    constraints.allergies.gluten && {
      words: [/กลูเตน/i, /แป้งสาลี/i, /wheat/i, /gluten/i],
      safe: /ไม่ใส่แป้งสาลี|ไม่ใส่กลูเตน|ห้ามใส่แป้งสาลี|ห้ามใส่กลูเตน|no gluten|without gluten|gluten free/i
    }
  ].filter(Boolean);

  return unsafeMatchers.some(item => item.words.some(pattern => pattern.test(text)) && !item.safe.test(text));
};

const buildThaiOrderSuggestion = (result, constraints) => {
  const safetyPhrases = thaiSafetyPhrases(constraints);
  const suggestion = String(result.thaiOrderSuggestion || '').trim();

  if (!safetyPhrases.length) return suggestion;

  const base = suggestion && !containsUnsafePositiveAllergen(suggestion, constraints) ? suggestion : `ขอ${result.thaiName || result.dishName || 'เมนูนี้'}`;
  const phraseCovered = phrase => {
    if (phrase === 'เผ็ดน้อย') return /เผ็ดน้อย|เผ็ดนิด|ไม่เผ็ด/i.test(base);
    if (phrase === 'ไม่เผ็ดเลย') return /ไม่เผ็ด/i.test(base);
    return base.includes(phrase);
  };
  const merged = [base, ...safetyPhrases.filter(phrase => !phraseCovered(phrase))].filter(Boolean);

  return merged.join(' ').trim();
};

const normalizeOrderOptions = value =>
  Array.isArray(value)
    ? value
        .map(item => ({
          label: String(item?.label || '').trim(),
          thai: String(item?.thai || '').trim()
        }))
        .filter(item => item.label || item.thai)
        .slice(0, 8)
    : [];

const normalizeOrderInterface = value => {
  if (!value || typeof value !== 'object') return null;

  const type = value.type === 'simple' ? 'simple' : 'customizable';
  const steps = Array.isArray(value.steps)
    ? value.steps
        .map(step => ({
          step: String(step?.step || '').trim(),
          thaiStep: String(step?.thaiStep || '').trim(),
          options: normalizeOrderOptions(step?.options)
        }))
        .filter(step => (step.step || step.thaiStep) && step.options.length > 0)
        .slice(0, 4)
    : [];

  return {
    type,
    dish: String(value.dish || '').trim(),
    thaiDish: String(value.thaiDish || '').trim(),
    steps: type === 'customizable' ? steps : [],
    options: type === 'simple' ? normalizeOrderOptions(value.options) : [],
    safetyWarnings: normalizeStrings(value.safetyWarnings),
    suggestedThaiOrderTemplate: String(value.suggestedThaiOrderTemplate || '').trim()
  };
};

router.post('/analyze', upload.single('image'), async (request, response, next) => {
  let uploadedImage = null;

  try {
    if (!request.file) {
      response.status(400).json({ error: 'image file field is required.' });
      return;
    }

    const profile = parseProfile(request.body.profile);
    const constraints = deriveTextConstraints(profile);
    uploadedImage = await uploadImageBuffer(request.file);
    const gemini = await analyzeImageWithGemini({ file: request.file, profile });
    const result = gemini.result || {};
    const allergyRisks = mergeRisks([...(Array.isArray(result.allergyRisks) ? result.allergyRisks : []), ...profileAllergyRisks(constraints)]);
    const dietaryRisks = mergeRisks([...(Array.isArray(result.dietaryRisks) ? result.dietaryRisks : []), ...profileDietaryRisks(constraints)]);

    response.status(201).json({
      id: null,
      imageUrl: null,
      analysis: {
        dishId: result.dishId || 'unknown',
        dishName: result.dishName || 'Unknown dish',
        thaiName: result.thaiName || '',
        confidence: Number(result.confidence) || 0,
        detectedText: normalizeStrings(result.detectedText),
        likelyIngredients: normalizeStrings(result.likelyIngredients),
        allergyRisks,
        dietaryRisks,
        suggestedQuestions: normalizeStrings([...(Array.isArray(result.suggestedQuestions) ? result.suggestedQuestions : []), ...profileQuestions(constraints)]),
        thaiOrderSuggestion: buildThaiOrderSuggestion(result, constraints),
        englishSummary: result.englishSummary || '',
        recommendedDishes: normalizeRecommendedDishes(result.recommendedDishes),
        orderInterface: normalizeOrderInterface(result.orderInterface),
        safeToOrder: Boolean(result.safeToOrder) && allergyRisks.length === 0 && dietaryRisks.length === 0
      },
      meta: {
        ephemeral: true,
        storage: 'cloudinary-auto-deleted',
        model: gemini.model,
        geminiKeyIndex: gemini.keyIndex,
        geminiAttempts: gemini.attempts
      }
    });
  } catch (error) {
    next(error);
  } finally {
    if (uploadedImage?.publicId) {
      deleteCloudinaryImage(uploadedImage.publicId).catch(error => {
        console.error(`Failed to delete temporary Cloudinary image ${uploadedImage.publicId}:`, error.message);
      });
    }
  }
});

router.get('/analyses', async (_request, response) => {
  response.json({
    items: [],
    ephemeral: true,
    message: 'Analysis history is disabled. Uploaded images are deleted after each request.'
  });
});

router.get('/analyses/:id', async (_request, response) => {
  response.status(404).json({
    error: 'Analysis history is disabled. Uploaded images are deleted after each request.'
  });
});

export { router as analysisRouter };
