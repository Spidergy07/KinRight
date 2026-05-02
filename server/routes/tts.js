import express from 'express';
import { generateSpeechWithGemini } from '../services/gemini.js';

const router = express.Router();

const MAX_TTS_TEXT_LENGTH = 300;

router.post('/tts', async (request, response, next) => {
  try {
    const text = String(request.body?.text || '').trim();

    if (!text) {
      response.status(400).json({ error: 'text is required.' });
      return;
    }

    if (text.length > MAX_TTS_TEXT_LENGTH) {
      response.status(413).json({ error: `text must be ${MAX_TTS_TEXT_LENGTH} characters or fewer.` });
      return;
    }

    const speech = await generateSpeechWithGemini({ text });

    response.setHeader('Content-Type', speech.mimeType);
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-KinRight-TTS-Model', speech.model);
    response.setHeader('X-KinRight-Gemini-Key-Index', String(speech.keyIndex));
    response.send(speech.audio);
  } catch (error) {
    next(error);
  }
});

export { router as ttsRouter };
