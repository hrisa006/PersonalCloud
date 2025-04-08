import express from 'express';
import cors from 'cors';
import userRoutes from './route/routes';
import fileRoutes from './route/file-routes';

const app = express();
app.use(express.json());
app.use(cors<express.Request>());
app.use('/api/test', userRoutes);
app.use('/file', fileRoutes);

export default app;