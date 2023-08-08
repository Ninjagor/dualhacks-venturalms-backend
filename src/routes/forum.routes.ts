import { Router } from 'express';
import ForumController from '../controllers/forum.controller';
import authenticateToken from '../middleware/auth.middleware';
import ForumMiddleware from '../middleware/forum.middleware';
import noParents from '../middleware/noparent.middleware';
import generalRosterMiddleware from '../middleware/generalRoster.middleware';

const router = Router();

// Route for fetching all users
router.post('/create/post', authenticateToken, noParents, generalRosterMiddleware, ForumController.createNewPost);
router.post('/create/reply', authenticateToken, noParents, generalRosterMiddleware, ForumController.createNewReply);

router.post('/getposts', authenticateToken, noParents, generalRosterMiddleware, ForumController.getPostsForClass);
// router.post('/getreplies', authenticateToken, noParents, generalRosterMiddleware, ForumController.getRepliesForPost);

export default router;