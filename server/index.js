import { app } from './app.js';
import { env } from './config/env.js';

const start = async () => {
  app.listen(env.port, () => {
    console.log(`KinRight API running on http://localhost:${env.port}`);
  });
};

start().catch(error => {
  console.error('Failed to start API server:', error.message);
  process.exit(1);
});

export { app };
