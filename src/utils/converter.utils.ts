import { PrismaClient, User } from "@prisma/client";
import UserDetailsRes from "../interfaces/user.interface";
import UserIdChunk from "../interfaces/chunk.interface";

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
        const studentDetails: UserDetailsRes = {
            id: student.id,
            name: student.name,
            email: student.email,
        }
        return studentDetails as UserDetailsRes;
    } catch(error) {
        throw new Error('Failed to convert');
    }
}

export async function chunkStudentIdToStudentDetails(chunk: UserIdChunk) {
    const studentDataList = []
    let i;
    for (i in chunk) {
        const data = await studentIdToStudentDetails(chunk[i].studentId);
        if (data) {
            studentDataList.push(data);
        }
    }
    console.log(studentDataList);
    return studentDataList;
}
