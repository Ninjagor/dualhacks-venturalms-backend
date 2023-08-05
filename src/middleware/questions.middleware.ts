import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { isAssignment } from '../utils/typecheck.utils';

const prisma = new PrismaClient();

function countCorrectChoices(choices: { isCorrect: boolean }[]): number {
    return choices.filter(choice => choice.isCorrect).length;
}

async function validateQuestions(req: Request, res: Response, next: NextFunction) {
    const { questionDetails } = req.body;
    const userId = req.user?.id;

    try {
        if (!isAssignment(req.body)) {
            return res.status(400).json({error: "bad request", errorData: "invalid assignment object"});
        }
        let i;
        for (i in questionDetails) {
            let currentQuestion = questionDetails[i];
            if (!(countCorrectChoices(currentQuestion.choices) === 1)) {
                return res.status(400).json({error: "bad request", errorData: "invalid choice parameters"});
            }
        }
        next();
    } catch(error) {
        next(error);
    }
}

export default validateQuestions;