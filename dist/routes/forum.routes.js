"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const forum_controller_1 = __importDefault(require("../controllers/forum.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const noparent_middleware_1 = __importDefault(require("../middleware/noparent.middleware"));
const generalRoster_middleware_1 = __importDefault(require("../middleware/generalRoster.middleware"));
const router = (0, express_1.Router)();
// Route for fetching all users
router.post('/create/post', auth_middleware_1.default, noparent_middleware_1.default, generalRoster_middleware_1.default, forum_controller_1.default.createNewPost);
router.post('/create/reply', auth_middleware_1.default, noparent_middleware_1.default, generalRoster_middleware_1.default, forum_controller_1.default.createNewReply);
router.post('/getposts', auth_middleware_1.default, noparent_middleware_1.default, generalRoster_middleware_1.default, forum_controller_1.default.getPostsForClass);
// router.post('/getreplies', authenticateToken, noParents, generalRosterMiddleware, ForumController.getRepliesForPost);
exports.default = router;
