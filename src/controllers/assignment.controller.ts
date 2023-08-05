import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parseISO } from "date-fns";

const prisma = new PrismaClient();

const AssignmentController = {
    createNewAssignment: async(req: Request, res: Response) => {
        const { classCode, questionDetails, expiryDate, assignmentName } = req.body;
        const userId = req.user?.id;

        try {
            const confAssignment = await prisma.assignment.findFirst({
                where: {
                    classId: classCode,
                    name: assignmentName
                }
            })
            if (confAssignment) {
                return res.status(409).json({ error: "An assignment with the same name already exists in the class." });
            }
            const parsedExpiryDate = parseISO(expiryDate);
            const newAssignment = await prisma.assignment.create({
                data: {
                    name: assignmentName,
                    expiryDate: parsedExpiryDate,
                    class: {
                        connect: { id: classCode }
                    }
                }
            })
            console.log(newAssignment);
            for (const question in questionDetails) {
                const newQuestion = await prisma.question.create({
                    data: {
                        prompt: questionDetails[question].questionPrompt,
                        questionOrderNumber: questionDetails[question].questionOrderNumber,
                        assignment: {
                            connect: { id: newAssignment.id }
                        }
                    }
                })
                console.log(newQuestion);

                for (const choice in questionDetails[question].choices) {
                    let currentChoice = questionDetails[question].choices[choice];

                    const newChoice = await prisma.choice.create({
                        data: {
                            value: currentChoice.answer,
                            isCorrectChoice: currentChoice.isCorrect,
                            question: {
                                connect: { id: newQuestion.id }
                            }
                        }
                    })
                    console.log(newChoice)
                }
            }

            res.status(200).json({data: "success", assignment: newAssignment});
        } catch(error) {
            console.error('Error creating class:', error);
            res.status(500).json({ "error": 'Failed to create assignment' });
        }

    },
    submitAssignment: async(req: Request, res: Response) => {
        const { assignmentId, answerDetails } = req.body;
        const userId = req.user?.id;
        const classCode = req.class?.id;

        try {
            let i;
            let correctAnswers = 0;
            for (i in answerDetails) {
                const referenceChoice = await prisma.choice.findFirst({
                    where: {
                        id: answerDetails[i].choiceId
                    }
                });
                if (referenceChoice?.isCorrectChoice) {
                    correctAnswers += 1;
                }
            }
            console.log(correctAnswers/answerDetails.length);
            const grade = Math.round(((correctAnswers/answerDetails.length) * 100))
            const newGradedAssignment = await prisma.gradedAssignment.create({
                data: {
                    grade: grade,
                    student: {
                        connect: { id: userId }
                    },
                    class: {
                        connect: { id: classCode }
                    }
                }
            })

            // Check if student has registered parents
            const studentSubAssignment = await prisma.studentsSubmittedAssignment.create({
                data: {
                    assignment: {
                        connect: { id: assignmentId }
                    },
                    student: {
                        connect: { id: userId }
                    }
                }
            })

            const referenceAssignmentDetails = await prisma.assignment.findFirst({
                where: {
                    id: assignmentId
                }
            })
            const referenceClassDetails = await prisma.class.findFirst({
                where: {
                    id: classCode
                }
            });


            res.status(200).json({data: "success"})
        } catch(error) {
            console.error('Error submitting:', error);
            res.status(500).json({ "error": 'Failed to submit assignment' });
        }
    },
    getQuestions: async(req: Request, res: Response) => {
        const userId = req.user?.id;
        const { assignmentId } = req.body;

        try {
            const questions = await prisma.question.findMany({
                where: {
                    assignmentId: assignmentId
                },
                include: {
                    choices: true
                }
            });
            res.status(200).json({data: "success", questions: questions});
        } catch(error) {
            console.error('Error fetching:', error);
            res.status(500).json({ "error": 'Failed to get questions' });
        }
    }
}

export default AssignmentController;