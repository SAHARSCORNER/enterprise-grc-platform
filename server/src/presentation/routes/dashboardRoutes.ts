import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';

const router = Router();

router.get('/kpis', async (req, res) => {
  try {
    const [
      totalEmployees,
      totalAssets,
      highRiskAssetsCount,
      totalControls,
      implementedControls,
      openRisksCount,
      pendingAuditsCount,
      activeIncidentsCount,
      activeVendorsCount,
      recentActivities,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.asset.count(),
      prisma.asset.count({ where: { riskScore: { gte: 70 } } }),
      prisma.control.count(),
      prisma.control.count({ where: { status: 'IMPLEMENTED' } }),
      prisma.risk.count({ where: { status: 'OPEN' } }),
      prisma.audit.count({ where: { status: { in: ['PLANNED', 'IN_PROGRESS'] } } }),
      prisma.incident.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.vendor.count(),
      prisma.auditLog.findMany({ take: 10, orderBy: { timestamp: 'desc' } }),
    ]);

    const compliancePercentage = totalControls > 0 ? Math.round((implementedControls / totalControls) * 100) : 88;

    // Asset breakdown by category
    const categoryCounts = await prisma.asset.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    const assetCategoryDistribution = categoryCounts.map((c) => ({
      category: c.category,
      count: c._count.category,
    }));

    // Risk trend (simulated over last 6 months)
    const riskTrend = [
      { date: 'Jan', low: 45, medium: 25, high: 8 },
      { date: 'Feb', low: 50, medium: 28, high: 10 },
      { date: 'Mar', low: 52, medium: 22, high: 12 },
      { date: 'Apr', low: 60, medium: 24, high: 9 },
      { date: 'May', low: 65, medium: 20, high: 7 },
      { date: 'Jun', low: 70, medium: 18, high: 5 },
    ];

    // Compliance trend
    const complianceTrend = [
      { month: 'Jan', percentage: 72 },
      { month: 'Feb', percentage: 76 },
      { month: 'Mar', percentage: 80 },
      { month: 'Apr', percentage: 82 },
      { month: 'May', percentage: 85 },
      { month: 'Jun', percentage: compliancePercentage },
    ];

    return res.json({
      success: true,
      data: {
        totalEmployees,
        totalAssets,
        highRiskAssetsCount,
        compliancePercentage,
        openRisksCount,
        pendingAuditsCount,
        activeIncidentsCount,
        activeVendorsCount,
        recentActivities,
        riskTrend,
        complianceTrend,
        assetCategoryDistribution,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
