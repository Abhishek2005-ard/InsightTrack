import express from 'express';
import { getStats, getSessions, getHeatmap } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, getStats);
router.get('/sessions', authMiddleware, getSessions);
router.get('/heatmap', authMiddleware, getHeatmap);

export default router;
