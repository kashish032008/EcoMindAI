import { Router, Request, Response } from 'express';
import WasteAnalysis from '../models/WasteAnalysis';

const router = Router();

// ─── POST /api/analyses — Save an analysis ───────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis = new WasteAnalysis(req.body);
    await analysis.save();
    res.status(201).json(analysis);
  } catch (err: unknown) {
    console.error('[analyses POST]', err);
    const message = err instanceof Error ? err.message : 'Save failed';
    res.status(500).json({ error: `Failed to save analysis: ${message}` });
  }
});

// ─── GET /api/analyses — List with search + filters ─────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, material, action, condition, page = '1', limit = '20' } = req.query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search && typeof search === 'string') {
      query.$or = [
        { objectName: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }
    if (material && material !== 'all') query.material = { $regex: material as string, $options: 'i' };
    if (action && action !== 'all') query.recommendedAction = action;
    if (condition && condition !== 'all') query.condition = condition;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));
    const skip = (pageNum - 1) * limitNum;

    const [analyses, total] = await Promise.all([
      WasteAnalysis.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      WasteAnalysis.countDocuments(query),
    ]);

    res.json({ analyses, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err: unknown) {
    console.error('[analyses GET]', err);
    res.status(500).json({ error: 'Failed to fetch analyses.' });
  }
});

// ─── GET /api/analyses/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis = await WasteAnalysis.findById(req.params.id).lean();
    if (!analysis) {
      res.status(404).json({ error: 'Analysis not found.' });
      return;
    }
    res.json(analysis);
  } catch (err: unknown) {
    console.error('[analyses GET/:id]', err);
    res.status(500).json({ error: 'Failed to fetch analysis.' });
  }
});

// ─── DELETE /api/analyses/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await WasteAnalysis.findByIdAndDelete(req.params.id);
    if (!result) {
      res.status(404).json({ error: 'Analysis not found.' });
      return;
    }
    res.json({ message: 'Analysis deleted successfully.' });
  } catch (err: unknown) {
    console.error('[analyses DELETE/:id]', err);
    res.status(500).json({ error: 'Failed to delete analysis.' });
  }
});

export default router;
