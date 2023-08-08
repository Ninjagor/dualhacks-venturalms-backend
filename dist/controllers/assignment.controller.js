"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const converter_utils_1 = require("../utils/converter.utils");
const prisma = new client_1.PrismaClient();
async function sendNotifsToParents(message, sender, currParentId) {
    const newMessageForParent = await prisma.parentInbox.create({
        data: {
            parent: {
                connect: { id: currParentId }
            },
            message: `${message}`,
            sender: `${sender}`
        }
    });
}
const AssignmentController = {
    didStudentSubmitAssignment: async (req, res) => {
        const { assignmentId } = req.body;
        const userId = req.user?.id;
        try {
            const confAssignment = await prisma.assignment.findFirst({
                where: {
                    id: assignmentId
                }
            });
            if (!confAssignment) {
                return res.status(404).json({ error: "Assignment not found" });
            }
            const studentSubmittedAssignment = await prisma.studentsSubmittedAssignment.findFirst({
                where: {
                    assignmentId: assignmentId,
                    studentId: userId
                }
            });
            if (studentSubmittedAssignment) {
                return res.status(200).json({ data: true });
            }
            return res.status(200).json({ data: false });
        }
        catch (error) {
            console.error("Error", error);
            return res.status(500).json({ error: "Error checking student" });
        }
    },
    getAssignmentsFromClass: async (req, res) => {
        const userId = req.user?.id;
        const { classCode } = req.body;
        try {
            const assignments = await prisma.assignment.findMany({
                where: {
                    classId: classCode
                }
            });
            console.log(assignments);
            console.log("CLASSCODE FROM ASSIGNMENT:", classCode);
            return res.status(200).json({ data: "success from assignment", assignments: assignments });
        }
        catch (error) {
            console.error("Error", error);
            return res.status(500).json({ error: "Error fetching assignments" });
        }
    },
    getGradedAssignments: async (req, res) => {
        const { classCode } = req.body;
        const userId = req.user?.id;
        try {
            const gradedAssignments = await prisma.gradedAssignment.findMany({
                where: {
                    studentId: userId,
                    classId: classCode
                },
                include: {
                    assignment: true
                }
            });
            const totalGrades = await prisma.averageGradeHistory.findMany({
                where: {
                    studentId: userId,
                    classId: classCode
                },
                orderBy: {
                    calculatedAt: "desc"
                }
            });
            res.status(200).json({ data: "success", gradedAssignments: gradedAssignments, averageGrade: totalGrades[0] });
        }
        catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({ "error": 'Failed to fetch grades' });
        }
    },
    createNewAssignment: async (req, res) => {
        const { classCode, questionDetails, expiryDate, assignmentName } = req.body;
        const userId = req.user?.id;
        try {
            const confAssignment = await prisma.assignment.findFirst({
                where: {
                    classId: classCode,
                    name: assignmentName
                }
            });
            if (confAssignment) {
                return res.status(409).json({ error: "An assignment with the same name already exists in the class." });
            }
            const parsedExpiryDate = (0, date_fns_1.parseISO)(expiryDate);
            const newAssignment = await prisma.assignment.create({
                data: {
                    name: assignmentName,
                    expiryDate: parsedExpiryDate,
                    class: {
                        connect: { id: classCode }
                    }
                }
            });
            console.log(newAssignment);
            let i;
            for (i in questionDetails) {
                const newQuestion = await prisma.question.create({
                    data: {
                        prompt: questionDetails[i].questionPrompt,
                        questionOrderNumber: questionDetails[i].questionOrderNumber,
                        assignment: {
                            connect: { id: newAssignment.id }
                        }
                    }
                });
                console.log(newQuestion);
                let x;
                for (x in questionDetails[i].choices) {
                    let currentChoice = questionDetails[i].choices[x];
                    const newChoice = await prisma.choice.create({
                        data: {
                            value: currentChoice.answer,
                            isCorrectChoice: currentChoice.isCorrect,
                            question: {
                                connect: { id: newQuestion.id }
                            }
                        }
                    });
                    console.log(newChoice);
                }
            }
            res.status(200).json({ data: "success", assignment: newAssignment });
        }
        catch (error) {
            console.error('Error creating class:', error);
            res.status(500).json({ "error": 'Failed to create assignment' });
        }
    },
    submitAssignment: async (req, res) => {
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
            console.log(correctAnswers / answerDetails.length);
            const grade = Math.round(((correctAnswers / answerDetails.length) * 100));
            const newGradedAssignment = await prisma.gradedAssignment.create({
                data: {
                    grade: grade,
                    student: {
                        connect: { id: userId }
                    },
                    class: {
                        connect: { id: classCode }
                    },
                    assignment: {
                        connect: { id: assignmentId }
                    }
                }
            });
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
            });
            // Finding average grade from history
            const allGradedAssignmentsByStudent = await prisma.gradedAssignment.findMany({
                where: {
                    studentId: userId,
                    classId: classCode
                }
            });
            let z;
            let totalGradePoints = 0;
            for (z in allGradedAssignmentsByStudent) {
                totalGradePoints += allGradedAssignmentsByStudent[z].grade;
            }
            const meanGrade = (totalGradePoints / allGradedAssignmentsByStudent.length);
            const newGradeReport = await prisma.averageGradeHistory.create({
                data: {
                    averageGrade: meanGrade,
                    student: {
                        connect: {
                            id: userId
                        }
                    },
                    class: {
                        connect: {
                            id: classCode
                        }
                    }
                }
            });
            const referenceAssignmentDetails = await prisma.assignment.findFirst({
                where: {
                    id: assignmentId
                }
            });
            const referenceClassDetails = await prisma.class.findFirst({
                where: {
                    id: classCode
                }
            });
            const parents = await prisma.parentsOfStudent.findMany({
                where: {
                    studentId: userId
                },
                include: {
                    parent: true
                }
            });
            const studentName = await (0, converter_utils_1.studentIdToStudentDetails)(userId);
            console.log(`STUDENTNAME: ${studentName}`);
            if (grade >= 75) {
                if (parents.length >= 1) {
                    let x;
                    for (x in parents) {
                        let currParent = parents[x].parent;
                        const newMessageForParent = await prisma.parentInbox.create({
                            data: {
                                parent: {
                                    connect: { id: currParent.id }
                                },
                                message: `Hello, ${currParent.name}! Your child, ${studentName?.name} has scored ${grade} out of 100 in the assignment ${referenceAssignmentDetails?.name}. This leaves your child's average grade in the class ${referenceClassDetails?.name} at ${newGradeReport.averageGrade}%. If we notice a difference in your child's grade trends, VenturaAI will notify you!`,
                                sender: "Ventura Assistant"
                            }
                        });
                    }
                }
                else {
                    console.log("no parents");
                }
            }
            else {
                if (parents.length >= 1) {
                    let x;
                    for (x in parents) {
                        let currParent = parents[x].parent;
                        const newMessageForParent = await prisma.parentInbox.create({
                            data: {
                                parent: {
                                    connect: { id: currParent.id }
                                },
                                message: `Hello, ${currParent.name}! Your child, ${studentName?.name} has scored poorly in the assignment ${referenceAssignmentDetails?.name}, scoring ${grade} out of 100. This leaves your child's average grade in the class ${referenceClassDetails?.name} at ${newGradeReport.averageGrade}%. VenturaAI will send some analytics shortly if neccesary.`,
                                sender: "Ventura Assistant"
                            }
                        });
                    }
                }
                else {
                    console.log("no parents");
                }
            }
            // Analytical AI!
            const referenceGradeHistory = await prisma.averageGradeHistory.findMany({
                where: {
                    studentId: userId,
                    classId: classCode
                },
                orderBy: {
                    calculatedAt: 'desc',
                },
            });
            let totalChange = 0;
            console.log(referenceGradeHistory.length);
            console.log(referenceGradeHistory.length % 5);
            console.log(referenceGradeHistory.length >= 6 && referenceGradeHistory.length % 5 === 0);
            if (referenceGradeHistory.length >= 6 && referenceGradeHistory.length % 5 === 0) {
                for (let i = 1; i < referenceGradeHistory.length; i++) {
                    const currentGrade = referenceGradeHistory[i].averageGrade;
                    const prevGrade = referenceGradeHistory[i - 1].averageGrade;
                    const change = currentGrade - prevGrade;
                    totalChange += change;
                }
                const averageChange = totalChange / (referenceGradeHistory.length - 1);
                const currentGrade = referenceGradeHistory[0].averageGrade;
                const fiveAssignmentsAgoGrade = referenceGradeHistory[4].averageGrade;
                const difference = (currentGrade - fiveAssignmentsAgoGrade) / 5;
                const diffOfAvgChangeAndDiff = difference - averageChange;
                // Current Grade: 78
                // FAAG: 83
                // AvgChange: 0.85
                // Difference: 10/5 = 2
                console.log(`FAAG: ${fiveAssignmentsAgoGrade}, DIFF: ${difference}, DIFF2: ${diffOfAvgChangeAndDiff}, AVG: ${averageChange}, CURRGRADE: ${currentGrade}`);
                if (diffOfAvgChangeAndDiff > averageChange) {
                    if (averageChange < 0) {
                        if (parents.length >= 1) {
                            let x;
                            for (x in parents) {
                                const currParrent = parents[x].parent;
                                const message = `Hello, ${currParrent.name}. This message is to inform you that your child, ${studentName?.name}'s grade downfall in the class "${referenceClassDetails?.name}" is evening out. This means that with continued support, it is possible to even see a rapid growth in the grade trendline. ${studentName?.name}'s average total change trend was ${averageChange}. In the PFA (Previous Fifth Assignment), it is shown the the change trendline has been brought to ${difference}. This is a ${diffOfAvgChangeAndDiff} difference. Please reach out to the class administrator for more details on your child's growth!`;
                                const sender = `VenturaAI`;
                                const currParentId = currParrent.id;
                                const newAIMsg = await sendNotifsToParents(message, sender, currParentId);
                            }
                        }
                        else {
                            console.log("no parents");
                        }
                        console.log("Your child's downtrend is decreasing!");
                    }
                    else {
                        if (parents.length >= 1) {
                            let x;
                            for (x in parents) {
                                const currParrent = parents[x].parent;
                                const message = `Hello, ${currParrent.name}. This message is to inform you that your child, ${studentName?.name}'s grade trendline in the class "${referenceClassDetails?.name}" is increasing! This signifies a rapid increase in educational growth and understanding!. ${studentName?.name}'s average total change trend was ${averageChange}. In the PFA (Previous Fifth Assignment), it is shown the the change trendline has been brought to ${difference}. This is a ${diffOfAvgChangeAndDiff} difference! Please reach out to the class administrator for more details on your child's growth!`;
                                const sender = `VenturaAI`;
                                const currParentId = currParrent.id;
                                const newAIMsg = await sendNotifsToParents(message, sender, currParentId);
                            }
                        }
                        else {
                            console.log("no parents");
                        }
                    }
                }
                else {
                    if (currentGrade < 85) {
                        if (diffOfAvgChangeAndDiff < -1.5) {
                            if (parents.length >= 1) {
                                let x;
                                for (x in parents) {
                                    const currParrent = parents[x].parent;
                                    const message = `Hello, ${currParrent.name}. This message is to inform you that your child, ${studentName?.name}'s is experiencing a severe downtrend in the class "${referenceClassDetails?.name}". It is vital that your child recieves extra attention and practices more. ${studentName?.name}'s average total change trend was ${averageChange}. In the PFA (Previous Fifth Assignment), it is shown the the change trendline has been brought to ${difference}. This is a ${diffOfAvgChangeAndDiff} difference. Your child's class administrator has been contacted about this downtrend. Please reach out to the class administrator for more details on your child's downtrend.`;
                                    const sender = `VenturaAI`;
                                    const currParentId = currParrent.id;
                                    const newAIMsg = await sendNotifsToParents(message, sender, currParentId);
                                }
                            }
                            else {
                                console.log("no parents");
                            }
                        }
                    }
                    else {
                        if (diffOfAvgChangeAndDiff < -3) {
                            if (parents.length >= 1) {
                                let x;
                                for (x in parents) {
                                    const currParrent = parents[x].parent;
                                    const message = `Hello, ${currParrent.name}. Your child, ${studentName?.name} has been performing well in the class "${referenceClassDetails?.name}"! However, with recent analysis, it is shown that a downtrend is developing. This is not a reason to panic, but please make sure that your child is confident with the current topic being reviewed. Your child's class admin was informed of this downtrend as well, and is ready to provide extra support. ${studentName?.name}'s average total change trend was ${averageChange}. In the PFA (Previous Fifth Assignment), it is shown the the change trendline has been brought to ${difference}. This is a ${diffOfAvgChangeAndDiff} difference. Please reach out to the class administrator for more details on your child's trendline!`;
                                    const sender = `VenturaAI`;
                                    const currParentId = currParrent.id;
                                    const newAIMsg = await sendNotifsToParents(message, sender, currParentId);
                                }
                            }
                            else {
                                console.log("no parents");
                            }
                        }
                    }
                }
            }
            // if (referenceGradeHistory.length >= 6) {
            // const currentGrade = referenceGradeHistory[0].averageGrade;
            // const fiveAssignmentsAgoGrade = referenceGradeHistory[5].averageGrade;
            // }
            res.status(200).json({ data: "success" });
        }
        catch (error) {
            console.error('Error submitting:', error);
            res.status(500).json({ "error": 'Failed to submit assignment' });
        }
    },
    getQuestions: async (req, res) => {
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
            const assignment = await prisma.assignment.findFirst({
                where: {
                    id: assignmentId
                }
            });
            res.status(200).json({ data: "success", questions: questions, assignmentDetails: assignment });
        }
        catch (error) {
            console.error('Error fetching:', error);
            res.status(500).json({ "error": 'Failed to get questions' });
        }
    }
};
exports.default = AssignmentController;
