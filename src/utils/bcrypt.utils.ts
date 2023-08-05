import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { newJwt } from "./jwt.utils";

const prisma = new PrismaClient;

export async function hash(password: string) {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        return hash
    } catch(e) {
        throw new Error('Failed to hash password');
    }
}

export async function verifyHash(password:string, hash:string) {
    try {
        return await bcrypt.compare(password, hash)
    } catch(e) {
        throw new Error('Failed to verify hashed password');
    }
}

export async function loginWithBcrypt(email: string, password: string) {
    try {
        const confUser = await prisma.user.findFirst({
            where: {
                email: email as string
            }
        })
        // console.log(confUser)
        if (confUser) {
            if (confUser.authProvider === "credentials") {
                if (await verifyHash(password as string, confUser.password as string)) {
                    return {data: newJwt({
                        email: email,
                        password: password,
                        name: confUser.name,
                        id: confUser.id
                    }), code: 200}
                } else {
                    return {data: "incorrect credentials", code: 403}
                }
            } else {
                return {data: "incorrect method", code: 400}
            }
        } else {
            return { data: "user not found", code: 404 }
        }
    } catch(error) {
        throw new Error('Failed to loginWithBcrypt');
    }
}