import { Router } from 'express';
import authenticateToken from '../middleware/auth.middleware';
import authenticateAdminRole from '../middleware/admin.middleware';
import AssignmentController from '../controllers/assignment.controller';
import validateQuestions from '../middleware/questions.middleware';
import validateSubmissions from '../middleware/submissions.middleware';
import rosterMiddleware from '../middleware/roster.middleware';
import generalRosterMiddleware from '../middleware/generalRoster.middleware';
import noParents from '../middleware/noparent.middleware';

const router = Router();

router.post('/create/assignment', authenticateToken, noParents ,authenticateAdminRole, validateQuestions, AssignmentController.createNewAssignment);

router.post('/create/submission', authenticateToken, noParents, rosterMiddleware,validateSubmissions, AssignmentController.submitAssignment);

router.post('/getquestions', authenticateToken, noParents, rosterMiddleware,AssignmentController.getQuestions);

router.post('/alreadysubmmited', authenticateToken, noParents, rosterMiddleware, AssignmentController.didStudentSubmitAssignment)

router.post('/getassignments', authenticateToken, noParents, generalRosterMiddleware, AssignmentController.getAssignmentsFromClass);

router.post('/getgrades', authenticateToken, noParents, generalRosterMiddleware, AssignmentController.getGradedAssignments);

export default router;