"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginWithBcrypt = exports.verifyHash = exports.hash = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_utils_1 = require("./jwt.utils");
const prisma = new client_1.PrismaClient;
async function hash(password) {
    try {
        const saltRounds = 10;
        const salt = await bcrypt_1.default.genSalt(saltRounds);
        const hash = await bcrypt_1.default.hash(password, salt);
        return hash;
    }
    catch (e) {
        throw new Error('Failed to hash password');
    }
}
exports.hash = hash;
async function verifyHash(password, hash) {
    try {
        return await bcrypt_1.default.compare(password, hash);
    }
    catch (e) {
        throw new Error('Failed to verify hashed password');
    }
}
exports.verifyHash = verifyHash;
async function loginWithBcrypt(email, password) {
    try {
        const confUser = await prisma.user.findFirst({
            where: {
                email: email
            }
        });
        // console.log(confUser)
        if (confUser) {
            if (confUser.authProvider === "credentials") {
                if (await verifyHash(password, confUser.password)) {
                    return { data: (0, jwt_utils_1.newJwt)({
                            email: email,
                            password: password,
                            name: confUser.name,
                            id: confUser.id
                        }), code: 200, user: confUser, isUser: true };
                }
                else {
                    return { data: "incorrect credentials", code: 403 };
                }
            }
            else {
                return { data: "incorrect method", code: 400 };
            }
        }
        else {
            const confParent = await prisma.parent.findFirst({
                where: {
                    email: email
                }
            });
            if (confParent) {
                if (await verifyHash(password, confParent.password)) {
                    return { data: (0, jwt_utils_1.newJwt)({
                            email: email,
                            password: password,
                            name: confParent.name,
                            id: confParent.id
                        }), code: 200, user: confParent, isUser: false };
                }
                else {
                    return { data: "incorrect credentials", code: 403 };
                }
            }
            else {
                return { data: "user not found", code: 404 };
            }
        }
    }
    catch (e) {
        throw new Error('Failed to loginWithBcrypt');
    }
}
exports.loginWithBcrypt = loginWithBcrypt;
