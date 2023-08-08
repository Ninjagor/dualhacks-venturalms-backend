import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { hash, loginWithBcrypt, verifyHash } from "../utils/bcrypt.utils";
import { newJwt } from "../utils/jwt.utils"

const prisma = new PrismaClient();

const ParentController = {
    getAllParents: async(req: Request, res: Response) => {

        try {
            const users = await prisma.parent.findMany();
            res.json(users);
        } catch (error) {
            console.error('Error fetching parents:', error);
            res.status(500).json({ error: 'Failed to fetch parents' });
        }
    },
    createNewParent: async(req: Request, res:Response) => {
        const { name, email, password } = req.body;
        try {
            const confUser = await prisma.user.findFirst({
                where: {
                    email: email
                }
            })
            console.log(confUser);
            if (confUser) {
                res.status(500).json({ error: "user already exists" })
            } else {

                const confParent = await prisma.parent.findFirst({
                    where: {
                        email: email
                    }
                })
                if (confParent) {
                    res.status(500).json({ error: "parent already exists" })
                } else {
                    const parent = await prisma.parent.create({
                        data: {
                            name,
                            email,
                            password: await hash(password),
                        }
                    })
                    const jwt = newJwt({
                        email: email,
                        password: password,
                        id: parent.id
                    })
                    res.status(201).json({ data: "success", parent: parent, token: jwt });
                }
            }
        } catch (error) {
            console.error('Error creating parent:', error);
            res.status(500).json({ error: 'Failed to create parent' });
        }
    },
    getChildren: async(req: Request, res: Response) => {
        const userId = req.user?.id

        try {
            const referenceParent = await prisma.parent.findFirst({
                where: {
                    id: userId
                }
            })
            if (!referenceParent) {
                return res.status(403).json({error: "only parents can access this endpoint"})
            }
            const children = await prisma.parentsOfStudent.findMany({
                where: {
                    parentId: userId
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            res.status(200).json({data: "success", children: children})
        } catch(error) {
            console.error('Error fetching children:', error);
            res.status(500).json({ error: 'Failed to fetch children' });
        }
    },
    addChild: async(req: Request, res: Response) => {
        const { childEmail, childPassword } = req.body;
        const userId = req.user?.id;

        try {
            if (!childEmail) {
                return res.status(400).json({error: "childEmail is a required parameter"})
            }
            if (!childPassword) {
                return res.status(400).json({error: "childPassword is a required parameter"})
            }
            const referenceParent = await prisma.parent.findFirst({
                where: {
                    id: userId
                }
            })
            if (!referenceParent) {
                return res.status(403).json({error: "only parents can access this endpoint"})
            }
            const referenceUser = await prisma.user.findFirst({
                where: {
                    email: childEmail
                }
            })
            if (!referenceUser) {
                return res.status(404).json({error: "student does not exist"})
            }
            const referenceLink = await prisma.parentsOfStudent.findFirst({
                where: {
                    studentId: referenceUser?.id
                }
            })
            if (referenceLink) {
                return res.status(400).json({error: "student already linked"})
            }
            const loginDetails = await loginWithBcrypt(childEmail, childPassword);
            if (loginDetails.code == 200) {
                const newLinking = await prisma.parentsOfStudent.create({
                    data: {
                        student: {
                            connect: {
                                id: referenceUser?.id
                            }
                        },
                        parent: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                })
                return res.status(200).json({data: "successfully linked student", linking: newLinking});
            } else {
                return res.status(403).json({error: "invalid child credentials"});
            }
        } catch (error) {
            console.error('Error linking child:', error);
            res.status(500).json({ error: 'Failed to link child' });
        }
    },
    viewParentInbox: async(req:Request, res:Response) => {
        const offset = parseInt(req.params.offset);
        const userId = req.user?.id;

        try {
            if (isNaN(offset) || offset < 0) {
                return res.status(400).json({ error: 'Invalid offset value' });
            }
            const referenceParent = await prisma.parent.findFirst({
                where: {
                    id: userId
                }
            })
            if (!referenceParent) {
                return res.status(403).json({error: "only parents can access this endpoint"})
            }

            const parentInboxMessages = await prisma.parentInbox.findMany({
                skip: offset*50,
                take: 5,
                orderBy: { sentAt: "desc" },
                where: {
                    parentId: userId
                }
            })

            return res.status(200).json({data: parentInboxMessages});

        } catch(error) {
            console.error('Error getting parent inbox:', error);
            res.status(500).json({ error: 'Failed to get inbox' });
        }
    }
}

export default ParentController;