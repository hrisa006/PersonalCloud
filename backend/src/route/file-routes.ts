import { Router } from 'express';
import { fileUpload } from '../controller/file-controller';
import { fileGet } from '../controller/file-controller';
import { fileUpdate } from '../controller/file-controller';
import { fileRemove } from '../controller/file-controller';
import { searchFiles } from '../controller/file-controller';

const fileRouter = Router();

fileRouter.post('/', fileUpload);
fileRouter.get('/', fileGet);
fileRouter.delete('/', fileRemove);
fileRouter.put('/', fileUpdate);
fileRouter.get('/search', searchFiles);

export default fileRouter;