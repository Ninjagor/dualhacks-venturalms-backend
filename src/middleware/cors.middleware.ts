import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

const corsMiddleware = cors({
  origin: '*', // Allow requests from all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

export default corsMiddleware;