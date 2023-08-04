import express, { Express } from 'express';
import corsMiddleware from './middleware/cors.middleware';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes'
import classRoutes from './routes/class.routes';
import errorHandler from './middleware/errorhandler.middleware';

// Create app
const app: Express = express();

// Apply CORS
app.use(corsMiddleware);

// Parse request body as JSON
app.use(express.json());

// userRoute
app.use(userRoutes);
app.use(authRoutes);
app.use(classRoutes);

app.use(errorHandler);


export default app;