import { Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { isSubmission } from '../utils/typecheck.utils';

const prisma = new PrismaClient();

async function rosterMiddleware(req: Request, res: Response, next: NextFunction) {
    const { assignmentId, classCode } = req.body;
    const userId = req.user?.id;
  
    try {
        let ClassCode;
        if (classCode) {
            console.log("classcode not null")
            ClassCode = classCode;
       } else {
            if (assignmentId) {
                const confAssignment = await prisma.assignment.findFirst({
                    where: {
                        id: assignmentId
                    },
                    include: {
                        class: true
                    }
                })
                console.log(`CONFASSIGNMENT: ${JSON.stringify(confAssignment)}`)
                if (!confAssignment) {
                    return res.status(404).json({error: "assignment not found"})
                }
                ClassCode = confAssignment.class.id;
            }
            else {
                return res.status(400).json({error: "Bad Request", errorInfo: "incomplete request parameters: must include classcode or assignmentid"})
            }
       }

       const referenceClass = await prisma.class.findFirst({
            where: {
                id: ClassCode
            }
        })
        if (!referenceClass) {
            return res.status(404).json({ error: "Class not found" })
        }

       const confClass = await prisma.studentsInClass.findFirst({
        where: {
            classId: ClassCode,
            studentId: userId
        }
       })
       console.log(`CONF CLASS: ${confClass}, STUDENTID: ${userId}, CLASSCODE: ${ClassCode}`);
    //    console.log(`!!! CONF CLASS: ${JSON.stringify(confClass)}`)
       if (!confClass) {
            if (referenceClass.classAdministratorId === userId) {
                return res.status(403).json({ error: "Administrator cannot submit assignment" })
            }
            return res.status(404).json({error: "User not in class"})
       }
  
        next();
    }   catch (error) {
        next(error);
    }
}

export default rosterMiddleware;