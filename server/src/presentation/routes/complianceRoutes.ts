import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { FrameworkName } from '@grc/shared';

const router = Router();

router.get('/frameworks', async (req, res) => {
  try {
    const frameworks = [FrameworkName.ISO_27001, FrameworkName.SOC_2, FrameworkName.NIST_CSF, FrameworkName.CIS_CONTROLS];
    const summaries = await Promise.all(
      frameworks.map(async (fw) => {
        const total = await prisma.control.count({ where: { framework: fw } });
        const implemented = await prisma.control.count({ where: { framework: fw, status: 'IMPLEMENTED' } });
        const inProgress = await prisma.control.count({ where: { framework: fw, status: 'PARTIALLY_IMPLEMENTED' } });
        const notImplemented = await prisma.control.count({ where: { framework: fw, status: 'NOT_IMPLEMENTED' } });

        const percentage = total > 0 ? Math.round((implemented / total) * 100) : 0;
        return {
          name: fw,
          totalControls: total,
          implemented,
          inProgress,
          notImplemented,
          compliancePercentage: percentage,
        };
      })
    );

    return res.json({ success: true, data: summaries });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/controls', async (req, res) => {
  try {
    const framework = req.query.framework as string;
    const where: any = {};
    if (framework) where.framework = framework;

    const controls = await prisma.control.findMany({ where, orderBy: { controlCode: 'asc' } });
    return res.json({ success: true, data: controls });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/controls/:id', async (req, res) => {
  try {
    const { status, progress, owner } = req.body;
    const updated = await prisma.control.update({
      where: { id: req.params.id },
      data: { status, progress: Number(progress), owner },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
