import { Router } from 'express';
import authenticateToken from '../middleware/auth.middleware';
import authenticateAdminRole from '../middleware/admin.middleware';
import AssignmentController from '../controllers/assignment.controller';
import validateSubmissions from '../middleware/submissions.middleware';
import rosterMiddleware from '../middleware/roster.middleware';
import validateQuestions from '../middleware/questions.middleware';

const router = Router();

router.post('/create/assignment', authenticateToken ,authenticateAdminRole, validateQuestions, AssignmentController.createNewAssignment);

router.post('/create/submission', authenticateToken,validateSubmissions, AssignmentController.submitAssignment);

router.post('/getquestions', authenticateToken, rosterMiddleware,AssignmentController.getQuestions);

export default router;