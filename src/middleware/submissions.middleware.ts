import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { isSubmission } from '../utils/typecheck.utils';

const prisma = new PrismaClient();

type answer = {
    choiceId: string;
}

interface answerDetails extends Array<answer> { }

interface ClassDetails {
    id: string;
    name: string;
    description?: string
    classAdministratorId: string;
}


declare global {
    namespace Express {
      interface Request {
        class?: ClassDetails;
      }
    }
}


function hasDuplicateChoiceIds(answerDetails: answerDetails): boolean {
    const choiceIdsSet = new Set<string>();
    for (const answer of answerDetails) {
      if (choiceIdsSet.has(answer.choiceId)) {
        return true; // Found a duplicate choiceId
      }
      choiceIdsSet.add(answer.choiceId);
    }
    return false; // No duplicate choiceId found
  }

async function validateSubmissions(req: Request, res: Response, next: NextFunction) {
    const { assignmentId, answerDetails } = req.body;
    const userId = req.user?.id;
  
    try {
        if (!isSubmission(req.body)) {
            return res.status(400).json({ error: "Bad request", errorData: "Invalid   submission object" });
        }
        const confAssignment = await prisma.assignment.findFirst({
          where: {
              id: assignmentId
          },
          include: {
              class: true
          }
        })

        if (!confAssignment) {
          return res.status(404).json({error: "assignment could not be found"})
        }

        const Class = confAssignment.class;
        console.log(Class);
        

        console.log(`CLASSADMIN: ${Class.classAdministratorId} USERID: ${userId} EQUALS: ${Class.classAdministratorId == userId}`)

        if (Class.classAdministratorId == userId) {
          return res.status(403).json({ error: 'administrator cannot submit assignment' });
        } else {
            console.log("Valid ID");
        }

        const referenceQuestions = await prisma.question.findMany({
            where: {
                assignmentId: assignmentId
            }
        })

        if (referenceQuestions.length == answerDetails.length) {
            console.log("Valid answer details")
        } else {
            return res.status(400).json({error: "Bad Request", errorInfo: "Invalid answer object"})
        }

        if(hasDuplicateChoiceIds(answerDetails)) {
            return res.status(400).json({error: "Bad Request", errorInfo: "Duplicating choice ids found"})
        }

        for (const answer in answerDetails) {
            let currentChoiceId = answerDetails[answer].choiceId;

            const referenceChoice = await prisma.choice.findFirst({
                where: {
                    id: currentChoiceId
                },
                include: {
                    question: true
                }
            })
            if (!referenceChoice) {
                return res.status(400).json({error: "Bad Request", errorInfo: "An invalid choice id was found"})
            }
            if (referenceChoice.question.assignmentId == assignmentId) {
                console.log("correct corresponding class")
            } else {
                return res.status(400).json({error: "Bad Request", errorInfo: "a question which does not correspond to the class was found"})
            }
        }

        const userAlreadySubmitted = await prisma.studentsSubmittedAssignment.findFirst({
            where: {
                studentId: userId,
                assignmentId: assignmentId
            }
        })

        if (userAlreadySubmitted) {
            return res.status(400).json({error: "user already submitted assignment"})
        }
        req.class = Class as ClassDetails;
        next();
    }   catch (error) {
        next(error);
    }
}

export default validateSubmissions;