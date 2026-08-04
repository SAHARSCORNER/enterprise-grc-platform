import { Router } from 'express';
import { AIAssistantService } from '../../infrastructure/aiService';

const router = Router();

router.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query parameter is required' });
    }

    const response = await AIAssistantService.processQuery(query);
    return res.json({ success: true, data: response });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
