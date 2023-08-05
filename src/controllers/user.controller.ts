import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hash, loginWithBcrypt } from "../utils/bcrypt.utils";
import { newJwt } from "../utils/jwt.utils"

const prisma = new PrismaClient();

const UserController = {
    getAllUsers: async(req: Request, res: Response) => {

        try {
            const users = await prisma.user.findMany();
            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    },
    createNewUserWithCredentials: async(req: Request, res: Response) => {
        const { name, email, password }= req.body;
        try {
            const confUser = await prisma.user.findFirst({
                where: {
                    email: email
                }
            })
            if (confUser) {
                res.status(500).json({ error: "user already exists" })
            } else {
                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: await hash(password),
                        authProvider: "credentials"
                    }
                })
                const jwt = newJwt({
                    email: email,
                    password: password,
                    id: user.id
                })
                res.status(201).json({ data: "success", user: user, token: jwt });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    },
    loginWithCredentials: async(req: Request, res: Response) => {

        const { email, password } = req.body

        try {
            const loginDetails = await loginWithBcrypt(email, password);
            // console.log(loginDetails.code);
            if (loginDetails.code == 200) {
                res.status(200).json({"data": "success", "token": loginDetails.data});
            } else {
                res.status(loginDetails.code).json({"data": loginDetails.data})
            }
        } catch (error) {
            console.error('Error logging in', error);
            res.status(500).json({ error: 'Failed to log in' });
        }
    },
    getClassesAsStudent: async(req: Request, res: Response) => {
        const userId = req.user?.id;

        try {
            const classes = await prisma.studentsInClass.findMany({
                where: {
                    studentId: userId
                },
                select: {
                    classId: true
                }
            })
            res.status(200).json({"data": classes})
        } catch(error) {
            console.error('Error', error);
            res.status(500).json({ error: 'Task failed' });
        }
    },
    getClassesAsAdmin: async(req: Request, res: Response) => {
        const userId = req.user?.id;

        try {
            const classes = await prisma.class.findMany({
                where: {
                    classAdministratorId: userId
                },
                select: {
                   id: true
                }
            })
            res.status(200).json({"data": classes})
        } catch(error) {
            console.error('Error', error);
            res.status(500).json({ error: 'Task failed' });
        }
    },
}

export default UserController;