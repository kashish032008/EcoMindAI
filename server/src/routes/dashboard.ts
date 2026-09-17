import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import WasteAnalysis from '../models/WasteAnalysis';

const router = Router();

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Return empty dashboard if not connected to database (demo mode)
    if (mongoose.connection.readyState !== 1) {
      res.json({
        overview: { total: 0, reusable: 0, recyclable: 0, preparationNeeded: 0, facilityDependent: 0, compost: 0, specialDisposal: 0 },
        materialDistribution: [],
        actionDistribution: [],
        recentAnalyses: [],
      });
      return;
    }

    const [
      totalCount,
      reuseCount,
      recycleCount,
      prepareRecycleCount,
      checkFacilityCount,
      specialDisposalCount,
      compostCount,
      materialAgg,
      actionAgg,
      recentAnalyses,
    ] = await Promise.all([
      WasteAnalysis.countDocuments(),
      WasteAnalysis.countDocuments({ recommendedAction: 'REUSE' }),
      WasteAnalysis.countDocuments({ recommendedAction: 'RECYCLE' }),
      WasteAnalysis.countDocuments({ recommendedAction: 'PREPARE_AND_RECYCLE' }),
      WasteAnalysis.countDocuments({ recommendedAction: 'CHECK_LOCAL_FACILITY' }),
      WasteAnalysis.countDocuments({ recommendedAction: 'SPECIAL_DISPOSAL' }),
      WasteAnalysis.countDocuments({ recommendedAction: 'COMPOST' }),
      WasteAnalysis.aggregate([
        { $group: { _id: '$material', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      WasteAnalysis.aggregate([
        { $group: { _id: '$recommendedAction', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      WasteAnalysis.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    // Normalise material names into chart-friendly categories
    const materialMap: Record<string, number> = {};
    for (const row of materialAgg) {
      const key = normaliseMaterial(row._id as string);
      materialMap[key] = (materialMap[key] || 0) + (row.count as number);
    }

    const materialDistribution = Object.entries(materialMap).map(([name, value]) => ({ name, value }));

    const actionLabels: Record<string, string> = {
      REUSE: 'Reuse',
      PREPARE_AND_RECYCLE: 'Prepare & Recycle',
      RECYCLE: 'Recycle',
      COMPOST: 'Compost',
      CHECK_LOCAL_FACILITY: 'Check Facility',
      SPECIAL_DISPOSAL: 'Special Disposal',
      GENERAL_DISPOSAL: 'General Disposal',
    };

    const actionDistribution = actionAgg.map((row) => ({
      name: actionLabels[row._id as string] || (row._id as string),
      value: row.count as number,
    }));

    res.json({
      overview: {
        total: totalCount,
        reusable: reuseCount,
        recyclable: recycleCount + prepareRecycleCount,
        preparationNeeded: prepareRecycleCount,
        facilityDependent: checkFacilityCount,
        compost: compostCount,
        specialDisposal: specialDisposalCount,
      },
      materialDistribution,
      actionDistribution,
      recentAnalyses,
    });
  } catch (err: unknown) {
    console.error('[dashboard]', err);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

function normaliseMaterial(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('plastic') || r.includes('pet') || r.includes('hdpe') || r.includes('ldpe') || r.includes('eps')) return 'Plastic';
  if (r.includes('glass')) return 'Glass';
  if (r.includes('paper') || r.includes('cardboard') || r.includes('carton')) return 'Paper/Cardboard';
  if (r.includes('metal') || r.includes('alumin') || r.includes('steel') || r.includes('tin')) return 'Metal';
  if (r.includes('organic') || r.includes('food') || r.includes('wood') || r.includes('compost')) return 'Organic';
  if (r.includes('e-waste') || r.includes('electronic') || r.includes('battery') || r.includes('circuit')) return 'E-waste';
  return 'Other';
}

export default router;
