import express from 'express';
import cors from 'cors';
import fileRoutes from './route/file-routes';
import {badRequestErrorHandler, globalExceptionHandler} from "./middleware/global-exception-handler";

const app = express();
app.use(express.json());
app.use(cors<express.Request>());
app.use('/file', fileRoutes);

app.use(badRequestErrorHandler);
app.use(globalExceptionHandler);

export default app;