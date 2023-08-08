"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const typecheck_utils_1 = require("../utils/typecheck.utils");
const prisma = new client_1.PrismaClient();
function countCorrectChoices(choices) {
    return choices.filter(choice => choice.isCorrect).length;
}
async function validateQuestions(req, res, next) {
    const { questionDetails } = req.body;
    const userId = req.user?.id;
    try {
        if (!(0, typecheck_utils_1.isAssignment)(req.body)) {
            return res.status(400).json({ error: "bad request", errorData: "invalid assignment object" });
        }
        let i;
        for (i in questionDetails) {
            let currentQuestion = questionDetails[i];
            if (!(countCorrectChoices(currentQuestion.choices) === 1)) {
                return res.status(400).json({ error: "bad request", errorData: "invalid choice parameters" });
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
exports.default = validateQuestions;
