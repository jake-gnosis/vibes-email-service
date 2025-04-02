import { Router } from 'express';
import * as UserController from '../controllers/UserController';
import { authenticateApiKey } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Protected routes
router.use(authenticateApiKey);
router.get('/profile', UserController.getProfile);
router.post('/regenerate-api-key', UserController.regenerateApiKey);

export default router; 