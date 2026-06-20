import express from 'express';
import { trackEvent } from '../controllers/telemetryController.js';

const router = express.Router();

router.post('/', trackEvent);

export default router;
