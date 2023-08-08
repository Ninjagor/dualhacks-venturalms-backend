import { Router } from 'express';
import UserController from '../controllers/user.controller';
import authenticateToken from '../middleware/auth.middleware';
import noParents from '../middleware/noparent.middleware';

const router = Router();

// Route for fetching all users
router.get('/users', UserController.getAllUsers);
router.post('/create/user', UserController.createNewUserWithCredentials);
router.get('/classesasstudent', authenticateToken, noParents, UserController.getClassesAsStudent);
router.get('/classesasadmin', authenticateToken, noParents, UserController.getClassesAsAdmin);

export default router;