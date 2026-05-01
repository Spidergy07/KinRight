import express from 'express';
import cors from 'cors';
import { env, getConfigStatus } from './config/env.js';
import { analysisRouter } from './routes/analysis.js';

const app = express();

const allowedOrigins = env.clientOrigin
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isDevelopmentLanOrigin = origin => {
  if (env.nodeEnv === 'production') return false;

  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || isDevelopmentLanOrigin(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error(`CORS blocked origin: ${origin}`);
      error.status = 403;
      callback(error);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    service: 'streetfood-ai-api',
    config: getConfigStatus()
  });
});

app.use('/api', analysisRouter);

app.use((error, _request, response, _next) => {
  if (error.name === 'MulterError') {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    response.status(status).json({ error: error.message });
    return;
  }

  const status = error.status || error.statusCode || 500;
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  response.status(safeStatus).json({
    error: error.message || 'Unexpected server error.'
  });
});

const start = async () => {
  app.listen(env.port, () => {
    console.log(`StreetFood AI API running on http://localhost:${env.port}`);
  });
};

start().catch(error => {
  console.error('Failed to start API server:', error.message);
  process.exit(1);
});

export { app };
