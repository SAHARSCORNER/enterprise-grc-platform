import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const showArchived = req.query.showArchived === 'true';

    const where: any = {};
    if (!showArchived) {
      where.isArchived = false;
      where.employmentStatus = { not: 'ARCHIVED' };
    }

    // Fetch 20 employees and all assets
    const [employees, assets] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: { assets: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.asset.findMany({
        where: { isGlobal: true },
      }),
    ]);

    const nodes: any[] = [];
    const edges: any[] = [];

    // 1. GLOBAL INFRASTRUCTURE & SHARED ASSETS CONTAINER
    nodes.push({
      id: 'container-global-assets',
      type: 'group',
      data: { label: 'Global Infrastructure & Shared Assets (Printers, Firewalls, Primary AD/DB)', type: 'global_container' },
      position: { x: 30, y: 30 },
      style: {
        width: 1100,
        height: 180,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        borderRadius: 16,
        border: '1px dashed #38bdf8',
        padding: 16,
      },
    });

    // Populate Global Asset Nodes
    assets.forEach((gAsset, gIdx) => {
      nodes.push({
        id: `global-asset-${gAsset.id}`,
        type: 'assetNode',
        parentNode: 'container-global-assets',
        extent: 'parent',
        data: {
          id: gAsset.id,
          label: gAsset.name,
          code: gAsset.assetTag,
          category: gAsset.category,
          riskScore: gAsset.riskScore,
          status: gAsset.status,
          isGlobal: true,
          type: 'asset',
        },
        position: { x: 30 + (gIdx % 6) * 175, y: 50 + Math.floor(gIdx / 6) * 60 },
      });
    });

    // 2. EMPLOYEE HIERARCHY TREE LAYOUT
    // Compute depth level for top-down manager hierarchy positioning
    const empMap = new Map<string, any>();
    employees.forEach((e) => empMap.set(e.id, e));

    const depthMap = new Map<string, number>();
    const getDepth = (empId: string): number => {
      if (depthMap.has(empId)) return depthMap.get(empId)!;
      const emp = empMap.get(empId);
      if (!emp || !emp.managerId || !empMap.has(emp.managerId)) {
        depthMap.set(empId, 0);
        return 0;
      }
      const d = 1 + getDepth(emp.managerId);
      depthMap.set(empId, d);
      return d;
    };

    employees.forEach((e) => getDepth(e.id));

    // Group employees by depth level (0: CEO, 1: VPs, 2: Managers, 3: Staff)
    const levelGroups: Map<number, any[]> = new Map();
    employees.forEach((e) => {
      const d = depthMap.get(e.id) || 0;
      if (!levelGroups.has(d)) levelGroups.set(d, []);
      levelGroups.get(d)!.push(e);
    });

    // Position Employee Tree Nodes
    const LEVEL_HEIGHT = 160;
    const START_Y = 260;

    levelGroups.forEach((levelEmps, levelIndex) => {
      const spacingX = 220;
      const totalWidth = levelEmps.length * spacingX;
      const startX = Math.max(30, 600 - totalWidth / 2);

      levelEmps.forEach((emp, colIndex) => {
        const empNodeId = `emp-${emp.id}`;

        let statusCategory = 'active';
        if (emp.isArchived || emp.employmentStatus === 'INACTIVE' || emp.employmentStatus === 'TERMINATED' || emp.employmentStatus === 'ARCHIVED') {
          statusCategory = 'inactive';
        } else if (emp.employmentStatus === 'PENDING') {
          statusCategory = 'pending';
        } else if (emp.riskScore > 50) {
          statusCategory = 'high_risk';
        }

        nodes.push({
          id: empNodeId,
          type: 'employeeNode',
          data: {
            id: emp.id,
            label: `${emp.firstName} ${emp.lastName}`,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            phone: emp.phone,
            code: emp.employeeCode,
            role: emp.designation,
            department: emp.department,
            status: emp.employmentStatus,
            statusCategory,
            riskScore: emp.riskScore,
            managerId: emp.managerId,
            managerName: emp.managerName,
            assignedAssetCount: emp.assets.length,
            isArchived: emp.isArchived,
            type: 'employee',
          },
          position: {
            x: startX + colIndex * spacingX,
            y: START_Y + levelIndex * LEVEL_HEIGHT,
          },
        });

        // Hierarchy Edge (Manager -> Employee)
        if (emp.managerId && empMap.has(emp.managerId)) {
          edges.push({
            id: `edge-mgr-${emp.managerId}-${emp.id}`,
            source: `emp-${emp.managerId}`,
            target: empNodeId,
            label: 'Manages',
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#06b6d4', strokeWidth: 2 },
          });
        }
      });
    });

    return res.json({
      success: true,
      data: { nodes, edges },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
