import { Router } from 'express';
import * as EmailController from '../controllers/EmailController';
import { authenticateApiKey, checkEmailQuota } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Email sending routes
router.post('/send', checkEmailQuota, EmailController.sendEmail);
router.post('/send-template', checkEmailQuota, EmailController.sendTemplatedEmail);

// Email status and history routes
router.get('/status/:id', EmailController.getEmailStatus);
router.get('/history', EmailController.getEmailHistory);

export default router; 