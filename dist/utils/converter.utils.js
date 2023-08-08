"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chunkStudentIdToStudentDetails = exports.studentIdToStudentDetails = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function studentIdToStudentDetails(studentId) {
    try {
        const student = await prisma.user.findFirst({
            where: {
                id: studentId
            },
        });
        if (!student) {
            return null;
        }
        const studentDetails = {
            id: student.id,
            name: student.name,
            email: student.email,
        };
        return studentDetails;
    }
    catch (error) {
        throw new Error('Failed to convert');
    }
}
exports.studentIdToStudentDetails = studentIdToStudentDetails;
async function chunkStudentIdToStudentDetails(chunk) {
    const studentDataList = [];
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
exports.chunkStudentIdToStudentDetails = chunkStudentIdToStudentDetails;
