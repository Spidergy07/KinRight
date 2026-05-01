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

router.post('/analyze', upload.single('image'), async (request, response, next) => {
  let uploadedImage = null;

  try {
    if (!request.file) {
      response.status(400).json({ error: 'image file field is required.' });
      return;
    }

    const profile = parseProfile(request.body.profile);
    uploadedImage = await uploadImageBuffer(request.file);
    const gemini = await analyzeImageWithGemini({ file: request.file, profile });
    const result = gemini.result || {};

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
        allergyRisks: normalizeRisks(result.allergyRisks),
        dietaryRisks: normalizeRisks(result.dietaryRisks),
        suggestedQuestions: normalizeStrings(result.suggestedQuestions),
        thaiOrderSuggestion: result.thaiOrderSuggestion || '',
        englishSummary: result.englishSummary || '',
        safeToOrder: Boolean(result.safeToOrder)
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
