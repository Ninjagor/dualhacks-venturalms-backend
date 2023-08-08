import { Router } from 'express';
import ClassController from '../controllers/class.controller'
import authenticateToken from '../middleware/auth.middleware';
import authenticateAdminRole from '../middleware/admin.middleware';
import noParents from '../middleware/noparent.middleware';
import { error } from 'console';

const router = Router();

router.get('/getclasses', authenticateToken, noParents, ClassController.getAllClasses);
router.post('/getstudentlist', authenticateToken, noParents, authenticateAdminRole, ClassController.getStudentsList);
router.post('/create/class', authenticateToken, noParents, ClassController.createNewClass);
router.post('/joinclass', authenticateToken, noParents, ClassController.joinClass);

export default router;