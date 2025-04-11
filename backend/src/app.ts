import express, {NextFunction} from 'express';
import cors from 'cors';
import userRoutes from './route/routes';
import fileRoutes from './route/file-routes';
import {badRequestErrorHandler, globalExceptionHandler} from "./middleware/global-exception-handler";

const app = express();
app.use(express.json());
app.use(cors<express.Request>());
app.use('/api/test', userRoutes);
app.use('/file', fileRoutes);

app.use(badRequestErrorHandler);
app.use(globalExceptionHandler);

export default app;