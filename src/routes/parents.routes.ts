import { Router } from 'express';
import ParentController from "../controllers/parents.controller";
import authenticateToken from '../middleware/auth.middleware';

const router = Router();

// Route for fetching all users
router.get('/parents', ParentController.getAllParents);
router.get('/get/parentinbox/:offset', authenticateToken, ParentController.viewParentInbox);
router.post('/create/parent', ParentController.createNewParent);
router.post('/pair/student', authenticateToken, ParentController.addChild);
router.get('/getchildren', authenticateToken, ParentController.getChildren)

export default router;