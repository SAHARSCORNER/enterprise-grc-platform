import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { SocketEvents } from '@grc/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const audits = await prisma.audit.findMany({
      include: { findings: true },
      orderBy: { startDate: 'desc' },
    });
    const formatted = audits.map((a) => ({
      ...a,
      evidenceFiles: JSON.parse(a.evidenceFiles || '[]'),
    }));
    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, scope, framework, leadAuditor, startDate, endDate } = req.body;
    const count = await prisma.audit.count();
    const auditCode = `AUD-2026-${(count + 1).toString().padStart(2, '0')}`;

    const audit = await prisma.audit.create({
      data: {
        auditCode,
        title,
        scope,
        framework: framework || 'ISO 27001',
        leadAuditor: leadAuditor || 'Arthur Auditor',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || '2026-12-31',
        status: 'PLANNED',
        approvalStatus: 'PENDING',
      },
    });

    broadcastEvent(SocketEvents.AUDIT_CREATED, audit);
    return res.status(201).json({ success: true, data: audit });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, approvalStatus } = req.body;
    const updated = await prisma.audit.update({
      where: { id: req.params.id },
      data: { status, approvalStatus },
    });

    if (status === 'COMPLETED') {
      broadcastEvent(SocketEvents.AUDIT_COMPLETED, updated);
    } else {
      broadcastEvent(SocketEvents.AUDIT_UPDATED, updated);
    }

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
