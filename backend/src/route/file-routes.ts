import { Router } from 'express';
import { fileUpload } from '../controller/file-controller';

const fileRouter = Router();

fileRouter.post('/upload', fileUpload);

export default fileRouter;