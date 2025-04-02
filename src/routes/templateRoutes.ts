import { Router } from 'express';
import * as TemplateController from '../controllers/TemplateController';
import { authenticateApiKey } from '../middlewares/auth';

const router = Router();

// Public routes
router.get('/public', TemplateController.listPublicTemplates);

// Protected routes
router.use(authenticateApiKey);
router.post('/', TemplateController.createTemplate);
router.put('/:id', TemplateController.updateTemplate);
router.delete('/:id', TemplateController.deleteTemplate);
router.get('/:id', TemplateController.getTemplate);
router.get('/', TemplateController.listTemplates);

export default router; 