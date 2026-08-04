import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { SocketEvents } from '@grc/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const policies = await prisma.policy.findMany({
      include: { acknowledgements: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: policies });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, category, owner, version, content } = req.body;
    const count = await prisma.policy.count();
    const policyCode = `POL-${100 + count + 1}`;

    const policy = await prisma.policy.create({
      data: {
        policyCode,
        title,
        category: category || 'Cybersecurity',
        version: version || '1.0',
        owner: owner || 'Elena Compliance Lead',
        status: 'APPROVED',
        effectiveDate: new Date().toISOString().split('T')[0],
        nextReviewDate: '2027-01-01',
        totalRequiredAcknowledgements: 100,
        content,
      },
    });

    broadcastEvent(SocketEvents.POLICY_CREATED, policy);
    return res.status(201).json({ success: true, data: policy });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/acknowledge', async (req, res) => {
  try {
    const { employeeId, employeeName } = req.body;
    const policy = await prisma.policy.findUnique({ where: { id: req.params.id } });
    if (!policy) return res.status(404).json({ success: false, error: 'Policy not found' });

    await prisma.policyAcknowledgement.create({
      data: {
        policyId: policy.id,
        employeeId,
        employeeName,
      },
    });

    const updated = await prisma.policy.update({
      where: { id: policy.id },
      data: { acknowledgementCount: policy.acknowledgementCount + 1 },
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
