import { Router } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { logAuditAction } from '../../infrastructure/auditLogger';
import { SocketEvents, UserRole } from '@grc/shared';

const router = Router();

// GET /api/v1/assets (Filter, search, pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const status = (req.query.status as string) || '';
    const all = req.query.all === 'true';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { assetTag: { contains: search } },
        { serialNumber: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const queryOptions: any = {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedEmployee: {
          select: { id: true, firstName: true, lastName: true, email: true, department: true, employeeCode: true },
        },
      },
    };

    if (!all) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    const [total, assets] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.findMany(queryOptions),
    ]);

    const formatted = await Promise.all(
      assets.map(async (a: any) => {
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify({ tag: a.assetTag, sn: a.serialNumber }));
        return {
          ...a,
          qrCodeDataUrl,
          assignedEmployeeName: a.assignedEmployee ? `${a.assignedEmployee.firstName} ${a.assignedEmployee.lastName}` : undefined,
          assignedEmployeeEmail: a.assignedEmployee ? a.assignedEmployee.email : undefined,
          assignedEmployeeCode: a.assignedEmployee ? a.assignedEmployee.employeeCode : undefined,
        };
      })
    );

    return res.json({
      success: true,
      data: formatted,
      meta: { page: all ? 1 : page, limit: all ? total : limit, total, totalPages: all ? 1 : Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/assets/:id
router.get('/:id', async (req, res) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: req.params.id },
      include: {
        assignedEmployee: true,
        assignmentLogs: { orderBy: { assignedAt: 'desc' } },
      },
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify({ tag: asset.assetTag, sn: asset.serialNumber }));

    return res.json({
      success: true,
      data: {
        ...asset,
        qrCodeDataUrl,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/assets (Create Asset)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      category,
      serialNumber,
      purchaseDate,
      warrantyExpiry,
      cost,
      location,
      status,
      riskScore,
      complianceStatus,
      assignedEmployeeId,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Asset name and category are required.' });
    }

    const count = await prisma.asset.count();
    const assetTag = req.body.assetTag || `AST-${20000 + count + 1}`;
    const sn = serialNumber || `SN-${category}-${Date.now()}`;

    let assignedEmp = null;
    let dept = null;
    if (assignedEmployeeId) {
      assignedEmp = await prisma.employee.findUnique({ where: { id: assignedEmployeeId } });
      if (assignedEmp) dept = assignedEmp.department;
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        category,
        serialNumber: sn,
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
        warrantyExpiry: warrantyExpiry || '2028-12-31',
        cost: cost !== undefined ? parseFloat(cost) : 1200.0,
        location: location || 'Headquarters (New York)',
        status: assignedEmployeeId ? 'ASSIGNED' : status || 'AVAILABLE',
        riskScore: riskScore !== undefined ? parseInt(riskScore) : 10,
        complianceStatus: complianceStatus || 'COMPLIANT',
        assignedEmployeeId: assignedEmployeeId || null,
        department: dept,
      },
    });

    if (assignedEmp) {
      await prisma.assetAssignmentLog.create({
        data: {
          assetId: asset.id,
          employeeId: assignedEmp.id,
          employeeName: `${assignedEmp.firstName} ${assignedEmp.lastName}`,
          assignedBy: (req as any).user?.name || 'Admin User',
          notes: 'Initial assignment upon creation',
        },
      });
    }

    broadcastEvent(SocketEvents.ASSET_CREATED, asset);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_CREATED',
      module: 'assets',
      entityId: asset.id,
      newValue: asset,
    });

    return res.status(201).json({ success: true, data: asset });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/assets/:id (Update Asset)
router.put('/:id', async (req, res) => {
  try {
    const oldAsset = await prisma.asset.findUnique({ where: { id: req.params.id } });
    if (!oldAsset) return res.status(404).json({ success: false, error: 'Asset not found' });

    const updateData: any = { ...req.body };
    if (updateData.cost !== undefined) updateData.cost = parseFloat(updateData.cost);
    if (updateData.riskScore !== undefined) updateData.riskScore = parseInt(updateData.riskScore);

    // Check employee assignment change
    if (updateData.assignedEmployeeId !== undefined && updateData.assignedEmployeeId !== oldAsset.assignedEmployeeId) {
      if (updateData.assignedEmployeeId) {
        const emp = await prisma.employee.findUnique({ where: { id: updateData.assignedEmployeeId } });
        if (emp) {
          updateData.department = emp.department;
          updateData.status = 'ASSIGNED';
          await prisma.assetAssignmentLog.create({
            data: {
              assetId: oldAsset.id,
              employeeId: emp.id,
              employeeName: `${emp.firstName} ${emp.lastName}`,
              assignedBy: (req as any).user?.name || 'Admin User',
              notes: 'Reassigned via asset edit',
            },
          });
        }
      } else {
        updateData.assignedEmployeeId = null;
        updateData.status = 'AVAILABLE';
      }
    }

    const updated = await prisma.asset.update({
      where: { id: req.params.id },
      data: updateData,
    });

    broadcastEvent(SocketEvents.ASSET_UPDATED, updated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_UPDATED',
      module: 'assets',
      entityId: updated.id,
      oldValue: oldAsset,
      newValue: updated,
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/assets/:id (Delete Asset)
router.delete('/:id', async (req, res) => {
  try {
    const oldAsset = await prisma.asset.findUnique({ where: { id: req.params.id } });
    if (!oldAsset) return res.status(404).json({ success: false, error: 'Asset not found' });

    await prisma.asset.delete({ where: { id: req.params.id } });

    broadcastEvent(SocketEvents.ASSET_DELETED, { id: req.params.id });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_DELETED',
      module: 'assets',
      entityId: req.params.id,
      oldValue: oldAsset,
    });

    return res.json({ success: true, data: { id: req.params.id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/assets/assign (Assign asset to employee)
router.post('/assign', async (req, res) => {
  try {
    const { assetId, employeeId, notes } = req.body;
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });

    if (!asset || !employee) {
      return res.status(404).json({ success: false, error: 'Asset or Employee not found' });
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedEmployeeId: employee.id,
        department: employee.department,
        status: 'ASSIGNED',
      },
      include: { assignedEmployee: true },
    });

    const assignmentLog = await prisma.assetAssignmentLog.create({
      data: {
        assetId: asset.id,
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        assignedBy: (req as any).user?.name || 'Admin',
        notes: notes || 'Assigned via Assets Directory',
      },
    });

    broadcastEvent(SocketEvents.ASSET_ASSIGNED, {
      asset: updatedAsset,
      employee,
      assignmentLog,
    });

    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_ASSIGNED',
      module: 'assets',
      entityId: asset.id,
      newValue: { assetTag: asset.assetTag, employeeCode: employee.employeeCode },
    });

    return res.json({ success: true, data: updatedAsset });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/assets/unassign
router.post('/unassign', async (req, res) => {
  try {
    const { assetId } = req.body;
    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedEmployeeId: null,
        status: 'AVAILABLE',
      },
    });

    broadcastEvent(SocketEvents.ASSET_REMOVED, { assetId });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_REMOVED',
      module: 'assets',
      entityId: assetId,
    });

    return res.json({ success: true, data: updatedAsset });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
