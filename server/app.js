import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { UPLOAD_ROOT } from './middleware/upload.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { paymentMode } from './services/checkoutService.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '200kb' }));

  app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '7d', fallthrough: false }));
  app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok', payments: paymentMode(), time: new Date().toISOString() } }));
  app.use('/api', generalLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
