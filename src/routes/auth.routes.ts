import { Router } from 'express';
import UserController from '../controllers/user.controller';
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

router.post('/auth/login/credentials', UserController.loginWithCredentials);

export default router;