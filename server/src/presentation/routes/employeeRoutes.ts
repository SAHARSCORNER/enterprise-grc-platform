import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { logAuditAction } from '../../infrastructure/auditLogger';
import { SocketEvents, UserRole } from '@grc/shared';

const router = Router();

// Helper: Circular manager dependency validation
async function checkCircularHierarchy(employeeId: string, candidateManagerId: string): Promise<boolean> {
  if (employeeId === candidateManagerId) return true;
  let currentId: string | null = candidateManagerId;
  const visited = new Set<string>();
  while (currentId) {
    if (currentId === employeeId) return true;
    if (visited.has(currentId)) break;
    visited.add(currentId);
    const mgr: { managerId: string | null } | null = await prisma.employee.findUnique({
      where: { id: currentId },
      select: { managerId: true },
    });
    currentId = mgr?.managerId || null;
  }
  return false;
}

// GET /api/v1/employees/template/csv - Download CSV Template
router.get('/template/csv', (_req, res) => {
  const csvHeaders = [
    'Employee Code',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Department',
    'Designation',
    'Manager Code or Email',
    'Office Location',
    'Employment Status',
    'Joining Date',
    'Exit Date',
    'Notes',
  ].join(',');

  const sampleRow1 = [
    'EMP-1001',
    'Sarah',
    'Jenkins',
    'sarah.jenkins@enterprise.grc',
    '+1-555-0192',
    'Engineering',
    'VP of Engineering',
    '',
    'Headquarters (New York)',
    'FULL_TIME',
    '2022-01-15',
    '',
    'Executive team lead',
  ].map((val) => `"${val}"`).join(',');

  const sampleRow2 = [
    'EMP-1002',
    'Marcus',
    'Vance',
    'marcus.vance@enterprise.grc',
    '+1-555-0184',
    'Engineering',
    'Senior Infrastructure Engineer',
    'EMP-1001',
    'Headquarters (New York)',
    'FULL_TIME',
    '2023-03-10',
    '',
    'Lead DevOps Specialist',
  ].map((val) => `"${val}"`).join(',');

  const csvContent = `${csvHeaders}\n${sampleRow1}\n${sampleRow2}`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=employee_bulk_import_template.csv');
  return res.status(200).send(csvContent);
});

// GET /api/v1/employees (Search, filter, paginate, or get all)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const search = (req.query.search as string) || '';
    const department = (req.query.department as string) || '';
    const status = (req.query.status as string) || '';
    const riskLevel = (req.query.riskLevel as string) || '';
    const managerId = (req.query.managerId as string) || '';
    const showArchived = req.query.showArchived === 'true';
    const all = req.query.all === 'true';

    const where: any = {};

    if (!showArchived) {
      where.isArchived = false;
      where.employmentStatus = { not: 'ARCHIVED' };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeCode: { contains: search } },
        { designation: { contains: search } },
        { officeLocation: { contains: search } },
      ];
    }
    if (department) where.department = department;
    if (status) where.employmentStatus = status;
    if (managerId) where.managerId = managerId;

    if (riskLevel) {
      if (riskLevel === 'LOW') where.riskScore = { lte: 20 };
      else if (riskLevel === 'MEDIUM') where.riskScore = { gt: 20, lte: 50 };
      else if (riskLevel === 'HIGH') where.riskScore = { gt: 50, lte: 80 };
      else if (riskLevel === 'CRITICAL') where.riskScore = { gt: 80 };
    }

    const queryOptions: any = {
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assets: true,
      },
    };

    if (!all) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    const [total, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany(queryOptions),
    ]);

    // Fetch direct report counts
    const directReportCounts = await prisma.employee.groupBy({
      by: ['managerId'],
      _count: { id: true },
      where: { managerId: { not: null } },
    });
    const reportCountMap = new Map<string, number>();
    directReportCounts.forEach((group) => {
      if (group.managerId) reportCountMap.set(group.managerId, group._count.id);
    });

    const formatted = employees.map((e: any) => ({
      ...e,
      skills: JSON.parse(e.skills || '[]'),
      assignedAssetCount: e.assets ? e.assets.length : 0,
      assignedAssets: e.assets || [],
      directReportsCount: reportCountMap.get(e.id) || 0,
    }));

    return res.json({
      success: true,
      data: formatted,
      meta: {
        page: all ? 1 : page,
        limit: all ? total : limit,
        total,
        totalPages: all ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/employees/:id
router.get('/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        assets: true,
        assignments: { orderBy: { assignedAt: 'desc' } },
      },
    });

    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Manager info
    let manager = null;
    if (employee.managerId) {
      manager = await prisma.employee.findUnique({
        where: { id: employee.managerId },
        select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true, designation: true },
      });
    }

    // Direct reports
    const directReports = await prisma.employee.findMany({
      where: { managerId: employee.id },
      select: { id: true, employeeCode: true, firstName: true, lastName: true, email: true, designation: true, department: true, riskScore: true },
    });

    // Audit History
    const auditHistory = await prisma.auditLog.findMany({
      where: { entityId: employee.id },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    return res.json({
      success: true,
      data: {
        ...employee,
        skills: JSON.parse(employee.skills || '[]'),
        manager,
        directReports,
        assignedAssets: employee.assets,
        assignedAssetCount: employee.assets.length,
        auditHistory,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/employees (Create Employee)
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      managerId,
      officeLocation,
      employmentStatus,
      joiningDate,
      terminationDate,
      skills,
      riskScore,
      notes,
    } = req.body;

    if (!firstName || !lastName || !email || !department || !designation) {
      return res.status(400).json({ success: false, error: 'First Name, Last Name, Email, Department, and Designation are required.' });
    }

    // Check duplicate email
    const existingEmail = await prisma.employee.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ success: false, error: `Employee with email "${email}" already exists.` });
    }

    // Generate unique code
    const count = await prisma.employee.count();
    const employeeCode = req.body.employeeCode || `EMP-${1000 + count + 1}`;

    let managerName = undefined;
    if (managerId) {
      const mgr = await prisma.employee.findUnique({ where: { id: managerId } });
      if (mgr) managerName = `${mgr.firstName} ${mgr.lastName}`;
    }

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        firstName,
        lastName,
        email,
        phone: phone || null,
        department,
        designation,
        managerId: managerId || null,
        managerName: managerName || null,
        officeLocation: officeLocation || 'Headquarters (New York)',
        employmentStatus: employmentStatus || 'FULL_TIME',
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        terminationDate: terminationDate || null,
        skills: JSON.stringify(skills || []),
        riskScore: riskScore !== undefined ? parseInt(riskScore) : 10,
        notes: notes || null,
        isArchived: employmentStatus === 'ARCHIVED',
      },
    });

    broadcastEvent(SocketEvents.EMPLOYEE_CREATED, employee);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_CREATED',
      module: 'employees',
      entityId: employee.id,
      newValue: employee,
    });

    return res.status(201).json({ success: true, data: employee });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/employees/:id (Update Employee)
router.put('/:id', async (req, res) => {
  try {
    const oldEmp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!oldEmp) return res.status(404).json({ success: false, error: 'Employee not found' });

    const updateData: any = { ...req.body };

    // Prevent circular reporting manager assignments
    if (updateData.managerId && updateData.managerId !== oldEmp.managerId) {
      const isCircular = await checkCircularHierarchy(req.params.id, updateData.managerId);
      if (isCircular) {
        return res.status(400).json({
          success: false,
          error: 'Cannot set reporting manager: this would create a circular reporting hierarchy loop.',
        });
      }
      const mgr = await prisma.employee.findUnique({ where: { id: updateData.managerId } });
      if (mgr) updateData.managerName = `${mgr.firstName} ${mgr.lastName}`;
    } else if (updateData.managerId === null || updateData.managerId === '') {
      updateData.managerId = null;
      updateData.managerName = null;
    }

    if (updateData.skills && Array.isArray(updateData.skills)) {
      updateData.skills = JSON.stringify(updateData.skills);
    }
    if (updateData.riskScore !== undefined) {
      updateData.riskScore = parseInt(updateData.riskScore);
    }
    if (updateData.employmentStatus) {
      updateData.isArchived = updateData.employmentStatus === 'ARCHIVED';
    }

    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: updateData,
    });

    broadcastEvent(SocketEvents.EMPLOYEE_UPDATED, updated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_UPDATED',
      module: 'employees',
      entityId: updated.id,
      oldValue: oldEmp,
      newValue: updated,
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/employees/:id (Delete Employee with confirmation requirement)
router.delete('/:id', async (req, res) => {
  try {
    const oldEmp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!oldEmp) return res.status(404).json({ success: false, error: 'Employee not found' });

    // 1. Unassign all assets first
    await prisma.asset.updateMany({
      where: { assignedEmployeeId: req.params.id },
      data: { assignedEmployeeId: null, status: 'AVAILABLE' },
    });

    // 2. Unset manager reference for direct reports
    await prisma.employee.updateMany({
      where: { managerId: req.params.id },
      data: { managerId: null, managerName: null },
    });

    // 3. Delete employee record
    await prisma.employee.delete({ where: { id: req.params.id } });

    broadcastEvent(SocketEvents.EMPLOYEE_DELETED, { id: req.params.id });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_DELETED',
      module: 'employees',
      entityId: req.params.id,
      oldValue: oldEmp,
    });

    return res.json({ success: true, data: { id: req.params.id } });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/employees/:id/duplicate (Duplicate Employee)
router.post('/:id/duplicate', async (req, res) => {
  try {
    const source = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!source) return res.status(404).json({ success: false, error: 'Source employee not found' });

    const count = await prisma.employee.count();
    const newCode = `EMP-${1000 + count + 1}`;
    const newEmail = `copy.${Date.now()}.${source.email}`;

    const duplicated = await prisma.employee.create({
      data: {
        employeeCode: newCode,
        firstName: `${source.firstName} (Copy)`,
        lastName: source.lastName,
        email: newEmail,
        phone: source.phone,
        department: source.department,
        designation: source.designation,
        managerId: source.managerId,
        managerName: source.managerName,
        employmentStatus: source.employmentStatus,
        joiningDate: new Date().toISOString().split('T')[0],
        officeLocation: source.officeLocation,
        skills: source.skills,
        riskScore: source.riskScore,
        notes: `Duplicated from ${source.employeeCode}`,
      },
    });

    broadcastEvent(SocketEvents.EMPLOYEE_CREATED, duplicated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_DUPLICATED',
      module: 'employees',
      entityId: duplicated.id,
      newValue: duplicated,
    });

    return res.status(201).json({ success: true, data: duplicated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/employees/:id/archive (Archive Employee)
router.patch('/:id/archive', async (req, res) => {
  try {
    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: { isArchived: true, employmentStatus: 'ARCHIVED' },
    });

    broadcastEvent(SocketEvents.EMPLOYEE_ARCHIVED, updated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_ARCHIVED',
      module: 'employees',
      entityId: updated.id,
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/employees/:id/restore (Restore Employee)
router.patch('/:id/restore', async (req, res) => {
  try {
    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: { isArchived: false, employmentStatus: 'FULL_TIME' },
    });

    broadcastEvent(SocketEvents.EMPLOYEE_RESTORED, updated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_RESTORED',
      module: 'employees',
      entityId: updated.id,
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/v1/employees/:id/manager (Change Reporting Manager / Drag-and-drop support)
router.patch('/:id/manager', async (req, res) => {
  try {
    const { managerId } = req.body;
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });

    let managerName: string | null = null;
    if (managerId) {
      if (await checkCircularHierarchy(req.params.id, managerId)) {
        return res.status(400).json({
          success: false,
          error: 'Cannot assign manager: circular reporting hierarchy loop detected.',
        });
      }
      const mgr = await prisma.employee.findUnique({ where: { id: managerId } });
      if (!mgr) return res.status(404).json({ success: false, error: 'Target manager not found' });
      managerName = `${mgr.firstName} ${mgr.lastName}`;
    }

    const updated = await prisma.employee.update({
      where: { id: req.params.id },
      data: { managerId: managerId || null, managerName },
    });

    broadcastEvent(SocketEvents.EMPLOYEE_MANAGER_CHANGED, updated);
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_MANAGER_CHANGED',
      module: 'employees',
      entityId: updated.id,
      oldValue: { managerId: emp.managerId, managerName: emp.managerName },
      newValue: { managerId: updated.managerId, managerName: updated.managerName },
    });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/employees/:id/assets/assign (Assign Asset)
router.post('/:id/assets/assign', async (req, res) => {
  try {
    const { assetId, notes } = req.body;
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedEmployeeId: emp.id,
        status: 'ASSIGNED',
        department: emp.department,
      },
    });

    await prisma.assetAssignmentLog.create({
      data: {
        assetId: asset.id,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        assignedBy: (req as any).user?.name || 'Admin User',
        notes: notes || 'Assigned via Employee Directory',
      },
    });

    broadcastEvent(SocketEvents.ASSET_ASSIGNED, { employeeId: emp.id, asset: updatedAsset });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_ASSIGNED',
      module: 'employees',
      entityId: emp.id,
      newValue: { assetId: asset.id, assetName: asset.name },
    });

    return res.json({ success: true, data: updatedAsset });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/employees/:id/assets/remove (Remove Asset)
router.post('/:id/assets/remove', async (req, res) => {
  try {
    const { assetId, notes } = req.body;
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) return res.status(404).json({ success: false, error: 'Employee not found' });

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found' });

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedEmployeeId: null,
        status: 'AVAILABLE',
      },
    });

    // Update assignment log unassignedAt
    const latestLog = await prisma.assetAssignmentLog.findFirst({
      where: { assetId: asset.id, employeeId: emp.id, unassignedAt: null },
      orderBy: { assignedAt: 'desc' },
    });
    if (latestLog) {
      await prisma.assetAssignmentLog.update({
        where: { id: latestLog.id },
        data: { unassignedAt: new Date(), notes: notes ? `${latestLog.notes || ''} | ${notes}` : latestLog.notes },
      });
    }

    broadcastEvent(SocketEvents.ASSET_REMOVED, { employeeId: emp.id, assetId: asset.id });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'ASSET_REMOVED',
      module: 'employees',
      entityId: emp.id,
      oldValue: { assetId: asset.id, assetName: asset.name },
    });

    return res.json({ success: true, data: updatedAsset });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/employees/bulk-import (CSV / XLSX Parsed Import)
router.post('/bulk-import', async (req, res) => {
  try {
    const { employees, overwriteExisting } = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ success: false, error: 'No employee records provided for import.' });
    }

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const rejected: Array<{ row: number; email?: string; code?: string; reason: string }> = [];

    const existingEmails = new Set(
      (await prisma.employee.findMany({ select: { email: true } })).map((e) => e.email.toLowerCase())
    );
    const existingCodes = new Set(
      (await prisma.employee.findMany({ select: { employeeCode: true } })).map((e) => e.employeeCode)
    );

    const emailMapToId = new Map<string, string>();
    const codeMapToId = new Map<string, string>();
    const allEmps = await prisma.employee.findMany({ select: { id: true, email: true, employeeCode: true } });
    allEmps.forEach((e) => {
      emailMapToId.set(e.email.toLowerCase(), e.id);
      codeMapToId.set(e.employeeCode, e.id);
    });

    for (let index = 0; index < employees.length; index++) {
      const rowNum = index + 1;
      const rec = employees[index];

      const firstName = rec.firstName || rec['First Name'];
      const lastName = rec.lastName || rec['Last Name'];
      const email = rec.email || rec['Email'];
      const department = rec.department || rec['Department'];
      const designation = rec.designation || rec['Designation'];
      const phone = rec.phone || rec['Phone'] || null;
      const officeLocation = rec.officeLocation || rec['Office Location'] || 'Headquarters (New York)';
      const employmentStatus = rec.employmentStatus || rec['Employment Status'] || 'FULL_TIME';
      const joiningDate = rec.joiningDate || rec['Joining Date'] || new Date().toISOString().split('T')[0];
      const terminationDate = rec.terminationDate || rec['Exit Date'] || null;
      const notes = rec.notes || rec['Notes'] || null;
      const managerRef = rec.managerRef || rec['Manager Code or Email'] || rec.managerId || null;

      if (!firstName || !lastName || !email || !department || !designation) {
        rejected.push({
          row: rowNum,
          email,
          reason: 'Missing required fields (First Name, Last Name, Email, Department, Designation).',
        });
        continue;
      }

      const lowerEmail = email.toLowerCase();
      let empCode = rec.employeeCode || rec['Employee Code'];

      // Check manager reference
      let managerId: string | null = null;
      let managerName: string | null = null;
      if (managerRef) {
        const mgrId = codeMapToId.get(managerRef) || emailMapToId.get(managerRef.toLowerCase());
        if (mgrId) {
          managerId = mgrId;
          const mgr = await prisma.employee.findUnique({ where: { id: mgrId } });
          if (mgr) managerName = `${mgr.firstName} ${mgr.lastName}`;
        }
      }

      const isEmailDuplicate = existingEmails.has(lowerEmail);
      if (isEmailDuplicate) {
        if (overwriteExisting) {
          const targetId = emailMapToId.get(lowerEmail);
          if (targetId) {
            await prisma.employee.update({
              where: { id: targetId },
              data: {
                firstName,
                lastName,
                department,
                designation,
                phone,
                officeLocation,
                employmentStatus,
                joiningDate,
                terminationDate,
                notes,
                managerId,
                managerName,
              },
            });
            updatedCount++;
            continue;
          }
        }
        skippedCount++;
        rejected.push({
          row: rowNum,
          email,
          reason: `Duplicate email "${email}" skipped. Enable overwrite to update existing.`,
        });
        continue;
      }

      if (!empCode) {
        const currentCount = existingCodes.size;
        empCode = `EMP-${1000 + currentCount + 1}`;
      }

      const newEmployee = await prisma.employee.create({
        data: {
          employeeCode: empCode,
          firstName,
          lastName,
          email,
          phone,
          department,
          designation,
          officeLocation,
          employmentStatus,
          joiningDate,
          terminationDate,
          notes,
          managerId,
          managerName,
          riskScore: Math.floor(Math.random() * 30) + 10,
        },
      });

      existingEmails.add(lowerEmail);
      existingCodes.add(empCode);
      emailMapToId.set(lowerEmail, newEmployee.id);
      codeMapToId.set(empCode, newEmployee.id);
      addedCount++;
    }

    broadcastEvent(SocketEvents.EMPLOYEE_BULK_IMPORTED, { added: addedCount, updated: updatedCount });
    await logAuditAction({
      userId: (req as any).user?.id || 'admin',
      userName: (req as any).user?.name || 'Admin User',
      userRole: (req as any).user?.role || UserRole.ADMINISTRATOR,
      action: 'EMPLOYEE_BULK_IMPORTED',
      module: 'employees',
      newValue: { addedCount, updatedCount, skippedCount, rejectedCount: rejected.length },
    });

    return res.json({
      success: true,
      data: {
        added: addedCount,
        updated: updatedCount,
        skipped: skippedCount,
        rejected,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
