import express from 'express';
import cors from 'cors';
import userRoutes from './route/test-routes';

const app = express();
app.use(express.json());
app.use(cors<express.Requet>());
app.use('/api/test', userRoutes);

export default app;