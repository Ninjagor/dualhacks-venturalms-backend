"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function authenticateAdminRole(req, res, next) {
    const { classCode } = req.body;
    const userId = req.user?.id;
    if (!classCode) {
        return res.status(400).json({ error: 'ClassCode is required' });
    }
    try {
        const referenceClass = await prisma.class.findFirst({
            where: {
                id: classCode
            }
        });
        if (!referenceClass) {
            return res.status(404).json({ error: 'Class Not Found' });
        }
        console.log(`RC Id: ${referenceClass.classAdministratorId}, USER ID ${userId}, EQUALS ${referenceClass.classAdministratorId == userId}`);
        if (referenceClass.classAdministratorId == userId) {
            console.log("Valid Auth");
        }
        else {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.default = authenticateAdminRole;
