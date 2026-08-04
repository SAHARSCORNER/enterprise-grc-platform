import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { SocketEvents } from '@grc/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const risks = await prisma.risk.findMany({ orderBy: { score: 'desc' } });
    const formatted = risks.map((r) => ({
      ...r,
      relatedAssetIds: JSON.parse(r.relatedAssetIds || '[]'),
      relatedEmployeeIds: JSON.parse(r.relatedEmployeeIds || '[]'),
      relatedDepartments: JSON.parse(r.relatedDepartments || '[]'),
    }));
    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, likelihood, impact, category, owner, mitigationPlan } = req.body;
    const count = await prisma.risk.count();
    const riskId = `RSK-${3000 + count + 1}`;
    const score = Number(likelihood) * Number(impact);

    const risk = await prisma.risk.create({
      data: {
        riskId,
        title,
        description,
        likelihood: Number(likelihood),
        impact: Number(impact),
        score,
        category: category || 'Infrastructure',
        owner: owner || 'admin@enterprise.grc',
        mitigationPlan,
        status: 'OPEN',
      },
    });

    broadcastEvent(SocketEvents.RISK_CREATED, risk);
    return res.status(201).json({ success: true, data: risk });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { likelihood, impact, status, mitigationPlan } = req.body;
    const existing = await prisma.risk.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: 'Risk not found' });

    const l = likelihood ? Number(likelihood) : existing.likelihood;
    const i = impact ? Number(impact) : existing.impact;
    const score = l * i;

    const updated = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        likelihood: l,
        impact: i,
        score,
        status: status || existing.status,
        mitigationPlan: mitigationPlan !== undefined ? mitigationPlan : existing.mitigationPlan,
      },
    });

    broadcastEvent(SocketEvents.RISK_UPDATED, updated);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
