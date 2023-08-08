"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function ForumMiddleware(req, res, next) {
    const { classCode, activateReplyMiddleware, postId } = req.body;
    const userId = req.user?.id;
    try {
        if (!classCode) {
            return res.status(400).json({ error: "ClassCode missing" });
        }
        const referenceClass = await prisma.class.findFirst({
            where: {
                id: classCode
            }
        });
        if (!referenceClass) {
            return res.status(404).json({ error: "Class not found" });
        }
        if (referenceClass.classAdministratorId === userId) {
            console.log("valid");
        }
        else {
            return res.status(403).json({ error: "not in class" });
        }
        if (activateReplyMiddleware) {
            if (!postId) {
                return res.status(400).json({ error: "PostId missing" });
            }
            const referencePost = await prisma.classPost.findFirst({
                where: {
                    id: postId
                },
                include: {
                    class: true
                }
            });
            if (!referencePost) {
                return res.status(404).json({ error: "Post not found" });
            }
            const referenceClassFromPost = await prisma.class.findFirst({
                where: {
                    id: referencePost.classId
                }
            });
            console.log(referencePost);
            if (!referenceClassFromPost) {
                return res.status(404).json({ error: "Class not found" });
            }
            if (referenceClassFromPost.classAdministratorId === userId) {
                console.log("valid");
            }
            else {
                return res.status(403).json({ error: "not in class" });
            }
        }
    }
    catch (error) {
        next(error);
    }
}
exports.default = ForumMiddleware;
