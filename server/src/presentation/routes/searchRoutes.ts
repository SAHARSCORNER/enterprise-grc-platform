import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { employees: [], assets: [], risks: [], policies: [], audits: [], vendors: [], incidents: [] } });
    }

    const [employees, assets, risks, policies, audits, vendors, incidents] = await Promise.all([
      prisma.employee.findMany({
        where: {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { email: { contains: q } },
            { employeeCode: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.asset.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { assetTag: { contains: q } },
            { serialNumber: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.risk.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { riskId: { contains: q } },
            { category: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.policy.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { policyCode: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.audit.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { auditCode: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.vendor.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { category: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.incident.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { incidentCode: { contains: q } },
          ],
        },
        take: 5,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        employees,
        assets,
        risks,
        policies,
        audits,
        vendors,
        incidents,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
