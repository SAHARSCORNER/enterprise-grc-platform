import { Router } from 'express';
import { prisma } from '../../infrastructure/prisma';
import { broadcastEvent } from '../../infrastructure/socket';
import { SocketEvents } from '@grc/shared';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({ orderBy: { riskScore: 'desc' } });
    const formatted = vendors.map((v) => ({
      ...v,
      certificates: JSON.parse(v.certificates || '[]'),
      complianceDocuments: JSON.parse(v.complianceDocuments || '[]'),
    }));
    return res.json({ success: true, data: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, category, contactName, contactEmail, riskScore, contractExpiryDate } = req.body;
    const score = Number(riskScore) || 20;
    let riskLevel = 'LOW';
    if (score > 75) riskLevel = 'CRITICAL';
    else if (score > 50) riskLevel = 'HIGH';
    else if (score > 30) riskLevel = 'MEDIUM';

    const vendor = await prisma.vendor.create({
      data: {
        name,
        category: category || 'SaaS Provider',
        contactName,
        contactEmail,
        riskScore: score,
        riskLevel,
        contractExpiryDate: contractExpiryDate || '2027-12-31',
        securityQuestionnaireCompleted: true,
      },
    });

    broadcastEvent(SocketEvents.VENDOR_CREATED, vendor);
    return res.status(201).json({ success: true, data: vendor });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
