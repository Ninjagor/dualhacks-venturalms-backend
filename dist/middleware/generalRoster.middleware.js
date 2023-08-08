"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function generalRosterMiddleware(req, res, next) {
    const { assignmentId, classCode } = req.body;
    const userId = req.user?.id;
    try {
        let ClassCode;
        if (classCode) {
            console.log("classcode not null");
            ClassCode = classCode;
        }
        else {
            if (assignmentId) {
                const confAssignment = await prisma.assignment.findFirst({
                    where: {
                        id: assignmentId
                    },
                    include: {
                        class: true
                    }
                });
                console.log(`CONFASSIGNMENT: ${JSON.stringify(confAssignment)}`);
                if (!confAssignment) {
                    return res.status(404).json({ error: "assignment not found" });
                }
                ClassCode = confAssignment.class.id;
            }
            else {
                return res.status(400).json({ error: "Bad Request", errorInfo: "incomplete request parameters: must include classcode or assignmentid" });
            }
        }
        const referenceClass = await prisma.class.findFirst({
            where: {
                id: ClassCode
            }
        });
        if (!referenceClass) {
            return res.status(404).json({ error: "Class not found" });
        }
        const confClass = await prisma.studentsInClass.findFirst({
            where: {
                classId: ClassCode,
                studentId: userId
            }
        });
        console.log(`CONF CLASS: ${confClass}, STUDENTID: ${userId}, CLASSCODE: ${ClassCode}`);
        //    console.log(`!!! CONF CLASS: ${JSON.stringify(confClass)}`)
        if (!confClass) {
            if (referenceClass.classAdministratorId === userId) {
                // pass
            }
            else {
                return res.status(404).json({ error: "User not in class" });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.default = generalRosterMiddleware;
