import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDatabase } from './server/config/db.js';
import { authRouter } from './server/routes/authRoutes.js';
import { schemeRouter } from './server/routes/schemeRoutes.js';
import { eligibilityRouter } from './server/routes/eligibilityRoutes.js';
import { recommendationRouter } from './server/routes/recommendationRoutes.js';
import { chatRouter } from './server/routes/chatRoutes.js';
import { applicationRouter } from './server/routes/applicationRoutes.js';
import { savedRouter } from './server/routes/savedRoutes.js';
import { notificationRouter } from './server/routes/notificationRoutes.js';
import { feedbackRouter } from './server/routes/feedbackRoutes.js';
import { adminRouter } from './server/routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/schemes', schemeRouter);
app.use('/api/eligibility', eligibilityRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/chat', chatRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/saved-schemes', savedRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);

// System Health Endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'AI-Powered Government Scheme Analyzer and Recommendation System',
    timestamp: new Date().toISOString(),
    environment: isProduction ? 'production' : 'development'
  });
});

async function startServer() {
  // Connect database and seed initial data
  await connectDatabase();

  if (!isProduction) {
    // In development mode, mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static build files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(` GOVERNMENT SCHEME ANALYZER & RECOMMENDATION SYSTEM`);
    console.log(` Server actively running at http://0.0.0.0:${PORT}`);
    console.log(` Default Admin Account:   admin@gov.in   / Admin@1234`);
    console.log(` Default Citizen Account: citizen@demo.in / Citizen@1234`);
    console.log(`================================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal error during server startup:', err);
  process.exit(1);
});
