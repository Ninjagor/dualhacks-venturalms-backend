"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const typecheck_utils_1 = require("../utils/typecheck.utils");
const prisma = new client_1.PrismaClient();
function hasDuplicateChoiceIds(answerDetails) {
    const choiceIdsSet = new Set();
    for (const answer of answerDetails) {
        if (choiceIdsSet.has(answer.choiceId)) {
            return true; // Found a duplicate choiceId
        }
        choiceIdsSet.add(answer.choiceId);
    }
    return false; // No duplicate choiceId found
}
async function validateSubmissions(req, res, next) {
    const { assignmentId, answerDetails } = req.body;
    const userId = req.user?.id;
    try {
        if (!(0, typecheck_utils_1.isSubmission)(req.body)) {
            return res.status(400).json({ error: "Bad request", errorData: "Invalid   submission object" });
        }
        const confAssignment = await prisma.assignment.findFirst({
            where: {
                id: assignmentId
            },
            include: {
                class: true
            }
        });
        if (!confAssignment) {
            return res.status(404).json({ error: "assignment could not be found" });
        }
        const Class = confAssignment.class;
        console.log(Class);
        console.log(`CLASSADMIN: ${Class.classAdministratorId} USERID: ${userId} EQUALS: ${Class.classAdministratorId == userId}`);
        if (Class.classAdministratorId == userId) {
            return res.status(403).json({ error: 'administrator cannot submit assignment' });
        }
        else {
            console.log("Valid ID");
        }
        const referenceQuestions = await prisma.question.findMany({
            where: {
                assignmentId: assignmentId
            }
        });
        if (referenceQuestions.length == answerDetails.length) {
            console.log("Valid answer details");
        }
        else {
            return res.status(400).json({ error: "Bad Request", errorInfo: "Invalid answer object" });
        }
        if (hasDuplicateChoiceIds(answerDetails)) {
            return res.status(400).json({ error: "Bad Request", errorInfo: "Duplicating choice ids found" });
        }
        let i;
        for (i in answerDetails) {
            let currentChoiceId = answerDetails[i].choiceId;
            const referenceChoice = await prisma.choice.findFirst({
                where: {
                    id: currentChoiceId
                },
                include: {
                    question: true
                }
            });
            if (!referenceChoice) {
                return res.status(400).json({ error: "Bad Request", errorInfo: "An invalid choice id was found" });
            }
            if (referenceChoice.question.assignmentId == assignmentId) {
                console.log("correct corresponding class");
            }
            else {
                return res.status(400).json({ error: "Bad Request", errorInfo: "a question which does not correspond to the class was found" });
            }
        }
        const userAlreadySubmitted = await prisma.studentsSubmittedAssignment.findFirst({
            where: {
                studentId: userId,
                assignmentId: assignmentId
            }
        });
        if (userAlreadySubmitted) {
            return res.status(400).json({ error: "user already submitted assignment" });
        }
        req.class = Class;
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.default = validateSubmissions;
