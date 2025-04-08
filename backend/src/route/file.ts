import { Router } from 'express';
import { fileUpload } from '../controller/file-upload-controller';

const fileRouter = Router();

fileRouter.post('/upload', fileUpload);

export default fileRouter;