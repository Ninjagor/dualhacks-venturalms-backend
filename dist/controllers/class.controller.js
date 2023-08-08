"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const converter_utils_1 = require("../utils/converter.utils");
const prisma = new client_1.PrismaClient();
const ClassController = {
    getAllClasses: async (req, res) => {
        try {
            const classes = await prisma.class.findMany();
            res.json(classes);
        }
        catch (error) {
            console.error('Error fetching classes:', error);
            res.status(500).json({ error: 'Failed to fetch classes' });
        }
    },
    userInClass: async (req, res) => {
        const userId = req.user?.id;
        const { classCode } = req.body;
        try {
            const studentsInClass = await prisma.studentsInClass.findFirst({
                where: {
                    classId: classCode,
                    studentId: userId
                }
            });
            if (studentsInClass) {
                return res.status(200).json({ data: true });
            }
            else {
                return res.json(200).json({ data: false });
            }
        }
        catch (error) {
            console.error("error getting info", error);
            res.status(500).json({ "error": 'Failed to get info' });
        }
    },
    createNewClass: async (req, res) => {
        const { name, description } = req.body;
        const id = req.user?.id;
        try {
            const newClass = await prisma.class.create({
                data: {
                    name: name,
                    description: description,
                    classAdministrator: {
                        connect: { id: id }
                    }
                }
            });
            res.status(200).json({ "data": "success", "classDetails": newClass });
        }
        catch (error) {
            console.error('Error creating class:', error);
            res.status(500).json({ "error": 'Failed to create class' });
        }
    },
    joinClass: async (req, res) => {
        const { classCode } = req.body;
        const userId = req.user?.id;
        try {
            const existingStudent = await prisma.studentsInClass.findFirst({
                where: {
                    classId: classCode,
                    studentId: userId
                }
            });
            if (existingStudent) {
                return res.status(400).json({ "error": 'Already in class' });
            }
            const classInfo = await prisma.class.findFirst({
                where: {
                    id: classCode
                }
            });
            if (!classInfo) {
                return res.status(404).json({ "error": 'Class not found' });
            }
            if (classInfo.classAdministratorId == userId) {
                return res.status(401).json({ "error": 'Admin of class cannot join class' });
            }
            const newStudent = await prisma.studentsInClass.create({
                data: {
                    class: {
                        connect: {
                            id: classInfo.id
                        }
                    },
                    student: {
                        connect: {
                            id: userId
                        }
                    }
                }
            });
            return res.status(200).json({ "data": 'Successfully joined the class' });
        }
        catch (error) {
            console.error('Error joining class:', error);
            res.status(500).json({ "error": 'Failed to join class' });
        }
    },
    getStudentsList: async (req, res) => {
        const { classCode } = req.body;
        try {
            const students = await prisma.studentsInClass.findMany({
                where: {
                    classId: classCode
                },
                select: {
                    studentId: true
                }
            });
            const updatedData = await (0, converter_utils_1.chunkStudentIdToStudentDetails)(students);
            res.status(200).json({ "data": updatedData, "rawData": students });
        }
        catch (error) {
            console.error('Error retrieving list', error);
            res.status(500).json({ "error": 'Failed to retrieve list' });
        }
    }
};
exports.default = ClassController;
