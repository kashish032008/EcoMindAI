import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { analyzeWaste } from '../services/aiService';
import { makeDecision } from '../services/decisionEngine';

const router = Router();

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, _file, cb) => {
    const ext = path.extname(_file.originalname).toLowerCase() || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|bmp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are supported (JPEG, PNG, GIF, WebP).'));
    }
  },
});

// ─── POST /api/analyze ────────────────────────────────────────────────────────
router.post('/', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided. Please upload a valid image.' });
    return;
  }

  const imagePath = req.file.path;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    // Step 1: AI Analysis
    const aiResult = await analyzeWaste(imagePath);

    // Step 2: Decision Engine
    const decision = makeDecision(aiResult);

    // Return combined result (not yet saved — client will call POST /api/analyses to save)
    res.json({
      imageUrl,
      objectName: aiResult.objectName,
      material: aiResult.material,
      materialCode: aiResult.materialCode,
      condition: aiResult.condition,
      contaminationLevel: aiResult.contaminationLevel,
      reusability: decision.reusability,
      recyclingStatus: decision.recyclingStatus,
      recommendedAction: decision.recommendedAction,
      recommendationReason: decision.recommendationReason,
      actionSteps: decision.actionSteps,
      actionLabel: decision.actionLabel,
      secondLifePotential: decision.secondLifePotential,
      secondLifeExplanation: decision.secondLifeExplanation,
      confidence: aiResult.confidence,
      isDemo: aiResult.isDemo,
    });
  } catch (err: unknown) {
    console.error('[analyze] Error:', err);
    const message = err instanceof Error ? err.message : 'Analysis failed.';
    res.status(500).json({ error: `Analysis failed: ${message}` });
  }
});

export default router;
