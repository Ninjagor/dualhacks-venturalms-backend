import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ForumController = {
    getPostsForClass: async(req: Request, res: Response) => {
        const { classCode, offset } = req.body
        const userId = req.user?.id

        try {
            const posts = await prisma.classPost.findMany({
                skip: offset*50,
                take: 5,
                orderBy: {
                    createdAt: "desc"
                },
                where: {
                    classId: classCode
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    class: true
                }
            });

            let repliesList = [];
            for (const i in posts) {
                const currentPost = posts[i];

                const replies = await prisma.postReply.findMany({
                    orderBy: {
                        createdAt: "asc"
                    },
                    where: {
                        postId: currentPost.id
                    }
                });

                repliesList.push(replies)

            }

            let finalPostData = [];
            for (const x in posts) {
                const newPostDetail = {
                    post: posts[x],
                    replies: repliesList[x]
                }
                finalPostData.push(newPostDetail)
            }

            return res.status(200).json({data: "success", postDetails: finalPostData})
        } catch(error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    },
    getRepliesForPost: async(req: Request, res: Response) => {
        const { postId } = req.body
        const userId = req.user?.id

        try {
            const replies = await prisma.postReply.findMany({
                orderBy: {
                    createdAt: "desc"
                },
                where: {
                    postId: postId
                }
            });

            return res.status(200).json({data: "success", replies: replies})
        } catch(error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Failed to get posts' });
        }
    },
    createNewPost: async(req: Request, res: Response) => {
        const { content, classCode } = req.body;
        const userId = req.user?.id;

        try {
            const newPost = await prisma.classPost.create({
                data: {
                    content: content,
                    class: {
                        connect: {
                            id: classCode
                        }
                    },
                    creator: {
                        connect: {
                            id: userId
                        }
                    }
                }
            });
            console.log(newPost);
            res.status(200).json({data: "success", post: newPost});
        } catch(error){
            console.error('Error creating post:', error);
            res.status(500).json({ error: 'Failed to create post' });
        }
    },
    createNewReply: async(req: Request, res: Response) => {
        const { content, postId } = req.body;
        const userId = req.user?.id;

        try {
            const newReply = await prisma.postReply.create({
                data: {
                    content: content,
                    creator: {
                        connect : { id: userId }
                    },
                    post: {
                        connect: { id: postId }
                    }
                }
            });
            res.status(200).json({data: "success", reply: newReply});
        } catch(error){
            console.error('Error creating reply:', error);
            res.status(500).json({ error: 'Failed to create reply' });
        }
    },
}

export default ForumController;