import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import ReqUserDetail from '../interfaces/jwt.interface'
dotenv.config();


// custom interface for a JWT user

declare global {
  namespace Express {
    interface Request {
      user?: ReqUserDetail;
    }
  }
}

// Validate the JWT token
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header, and if it has a token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = user as ReqUserDetail;
    next();
  });
}

export default authenticateToken;