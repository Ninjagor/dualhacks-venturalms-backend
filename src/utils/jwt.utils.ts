import jwt, { Jwt } from 'jsonwebtoken';
import dotenv from 'dotenv';
import JwtPayload from "../interfaces/jwt.interface"
dotenv.config();

export const newJwt = (payload: JwtPayload): string => {
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET as string);
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate JWT token');
  }
};

export const verifyJwt = (token: string): boolean => {
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};