import { Router } from 'express';
import { generatePdfReport, generateCsvReport } from '../../infrastructure/reportGenerator';

const router = Router();

router.get('/pdf', async (req, res) => {
  try {
    const type = (req.query.type as string) || 'executive';
    const pdfBuffer = await generatePdfReport(type);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=GRC_${type}_report.pdf`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/csv', async (req, res) => {
  try {
    const type = (req.query.type as string) || 'asset';
    const csvData = await generateCsvReport(type);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=GRC_${type}_export.csv`);
    return res.send(csvData);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
