import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
};

const geminiApiKeys = [1, 2, 3, 4, 5, 6, 7]
  .map(index => process.env[`GEMINI_API_KEY_${index}`]?.trim())
  .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseNumber(process.env.PORT, 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'kinright/uploads'
  },
  gemini: {
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
    ttsModel: process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview',
    ttsVoice: process.env.GEMINI_TTS_VOICE || 'Kore',
    apiKeys: geminiApiKeys,
    maxRetries: Math.min(parseNumber(process.env.MAX_GEMINI_RETRIES, 1), 7)
  },
  maxUploadMb: parseNumber(process.env.MAX_UPLOAD_MB, 4)
};

export const getConfigStatus = () => ({
  analysisHistory: false,
  imageRetention: 'deleted-after-analysis',
  cloudinary: Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret),
  geminiKeys: env.gemini.apiKeys.length,
  geminiModel: env.gemini.model,
  geminiMaxRetries: env.gemini.maxRetries,
  geminiTtsModel: env.gemini.ttsModel,
  maxUploadMb: env.maxUploadMb
});
