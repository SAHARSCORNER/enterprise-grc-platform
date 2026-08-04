import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { logAuditAction } from '../../infrastructure/auditLogger';
import { SocketEvents, UserRole } from '@grc/shared';

const router = Router();

// GET /api/v1/tickets (List tickets)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = (req.query.search as string) || '';
    const status = (req.query.status as string) || '';
    const priority = (req.query.priority as string) || '';
    const category = (req.query.category as string) || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { ticketCode: { contains: search } },
        { description: { contains: search } },
        { reporter: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;

    const [total, tickets] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: tickets,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/tickets (Raise New Ticket)
router.post('/', async (req, res) => {
  try {
    const { title, description, category, priority, reporter, assignedTo } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Title, description, and category are required.' });
    }

    const count = await prisma.ticket.count();
    const ticketCode = `TCK-${new Date().getFullYear()}-${100 + count + 1}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketCode,
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        status: 'OPEN',
        reporter: reporter || (req as any).user?.name || 'System Administrator',
        assignedTo: assignedTo || null,
      },
    });

    broadcastEvent(SocketEvents.TICKET_CREATED, ticket);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'TICKET_CREATED',
      module: 'tickets',
      entityId: ticket.id,
      newValue: ticket,
    });

    return res.status(201).json({ success: true, data: ticket });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/tickets/:id (Update Ticket Status or Assignee)
router.put('/:id', async (req, res) => {
  try {
    const oldTicket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!oldTicket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    const updated = await prisma.ticket.update({
      where: { id: req.params.id },
      data: req.body,
    });

    broadcastEvent(SocketEvents.TICKET_UPDATED, updated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'TICKET_UPDATED',
      module: 'tickets',
      entityId: updated.id,
      oldValue: oldTicket,
      newValue: updated,
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/tickets/:id
router.delete('/:id', async (req, res) => {
  try {
    const oldTicket = await prisma.ticket.findUnique({ where: { id: req.params.id } });
    if (!oldTicket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    await prisma.ticket.delete({ where: { id: req.params.id } });

    broadcastEvent(SocketEvents.TICKET_DELETED, { id: req.params.id });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'TICKET_DELETED',
      module: 'tickets',
      entityId: req.params.id,
      oldValue: oldTicket,
    });

    return res.json({ success: true, data: { id: req.params.id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
