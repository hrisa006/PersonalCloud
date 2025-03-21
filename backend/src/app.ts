import express from 'express';
import userRoutes from './route/test-routes';

const app = express();
app.use(express.json());

app.use('/api/test', userRoutes);

export default app;