import { Request, Response, NextFunction } from 'express';

import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function noParents(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;

    try {
        const referenceParent = await prisma.parent.findFirst({
            where: {
                id: userId
            }
        })
        if (referenceParent) {
            return res.status(403).json({error: "Parents not authorized in this endpoint"})
        }

        next();
    } catch(error) {
        next(error);
    }
}       

export default noParents;