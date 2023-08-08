"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.newJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const newJwt = (payload) => {
    try {
        const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET);
        return token;
    }
    catch (error) {
        console.error('Error generating JWT token:', error);
        throw new Error('Failed to generate JWT token');
    }
};
exports.newJwt = newJwt;
const verifyJwt = (token) => {
    try {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return true;
    }
    catch (error) {
        console.error('Error verifying token:', error);
        return false;
    }
};
exports.verifyJwt = verifyJwt;
