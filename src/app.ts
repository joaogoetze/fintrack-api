import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import { routes } from './routes';

export const app = express();

app.use(express.json());
app.use(cors());
app.use(routes);
app.use(errorHandler);