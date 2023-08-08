"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function noParents(req, res, next) {
    const userId = req.user?.id;
    try {
        const referenceParent = await prisma.parent.findFirst({
            where: {
                id: userId
            }
        });
        if (referenceParent) {
            return res.status(403).json({ error: "Parents not authorized in this endpoint" });
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.default = noParents;
