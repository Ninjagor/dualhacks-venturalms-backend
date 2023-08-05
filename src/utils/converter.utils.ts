import { StudentId, UserDetailsResult } from "../interfaces";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function studentIdToStudentDetails(studentId: string) {
    try {
        const student = await prisma.user.findFirst({
            where: {
                id: studentId
            },
        })
        if (!student) {
            return null;
        }
        const studentDetails: UserDetailsResult = {
            id: student.id,
            name: student.name,
            email: student.email,
        }
        return studentDetails as UserDetailsResult;
    } catch(error) {
        throw new Error('Failed to convert');
    }
}

export async function chunkStudentIdToStudentDetails(students: StudentId[]) {
    const studentDataList = []
    for (const i in students) {
        const data = await studentIdToStudentDetails(students[i].studentId);
        if (data) {
            studentDataList.push(data);
        }
    }
    console.log(studentDataList);
    return studentDataList;
}