import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import analyzeRouter from './routes/analyze';
import analysesRouter from './routes/analyses';
import dashboardRouter from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecomind-ai';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/analyses', analysesRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'EcoMind AI Server', timestamp: new Date().toISOString() });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[EcoMind Error]', err.message);
  res.status(500).json({ error: 'Internal server error. Please try again.' });
});

// Connect to MongoDB then start server
async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB connection failed — running without database (demo mode)');
    console.warn('   Start MongoDB or set MONGODB_URI in .env to enable persistence.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 EcoMind AI Server running on http://localhost:${PORT}`);
    let aiMode = 'Demo Mode';
    if (process.env.GOOGLE_VISION_API_KEY) aiMode = 'Real AI (Gemini)';
    else if (process.env.OPENAI_API_KEY) aiMode = 'Real AI (OpenAI)';
    console.log(`   AI Mode: ${aiMode}`);
  });
}

start();
