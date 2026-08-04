import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { SocketEvents } from '@grc/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({ orderBy: { reportedAt: 'desc' } });
    const formatted = incidents.map((i) => ({
      ...i,
      affectedAssetIds: JSON.parse(i.affectedAssetIds || '[]'),
      affectedEmployeeIds: JSON.parse(i.affectedEmployeeIds || '[]'),
    }));
    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, severity, owner, rootCause, lessonsLearned } = req.body;
    const count = await prisma.incident.count();
    const incidentCode = `INC-2026-${(count + 1).toString().padStart(3, '0')}`;

    const incident = await prisma.incident.create({
      data: {
        incidentCode,
        title,
        description,
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        owner: owner || 'admin@enterprise.grc',
        rootCause,
        lessonsLearned,
      },
    });

    broadcastEvent(SocketEvents.INCIDENT_CREATED, incident);
    return res.status(201).json({ success: true, data: incident });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, rootCause, lessonsLearned } = req.body;
    const isClosed = status === 'CLOSED';

    const updated = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        status,
        rootCause,
        lessonsLearned,
        resolvedAt: isClosed ? new Date() : undefined,
      },
    });

    if (isClosed) {
      broadcastEvent(SocketEvents.INCIDENT_CLOSED, updated);
    } else {
      broadcastEvent(SocketEvents.INCIDENT_UPDATED, updated);
    }

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
