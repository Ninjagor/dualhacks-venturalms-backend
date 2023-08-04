import { Router } from 'express';
import ClassController from '../controllers/class.controller'
import authenticateToken from '../middleware/auth.middleware';
import authenticateAdminRole from '../middleware/admin.middleware';
import { error } from 'console';

const router = Router();

router.get('/getclasses', authenticateToken, ClassController.getAllClasses);
router.post('/getstudentlist', authenticateToken, authenticateAdminRole, ClassController.getStudentsList);
router.post('/create/class', authenticateToken, ClassController.createNewClass);
router.post('/joinclass', authenticateToken, ClassController.joinClass);

export default router;