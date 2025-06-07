import { Router } from 'express';
import {
    fileUpload,
    getFilesSharedWithUser, getUserFilePermission,
    getUserFileTree,
    getUsersFileIsSharedWith,
    shareFileWithUser, unshareFile, updateSharedPermission
} from '../controller/file-controller';
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

fileRouter.get('/user/tree', getUserFileTree);

fileRouter.post('/share', shareFileWithUser);
fileRouter.get('/shared', getFilesSharedWithUser);
fileRouter.delete('/shared', unshareFile);
fileRouter.get('/shared/users', getUsersFileIsSharedWith);
fileRouter.put('/shared/permission', updateSharedPermission);
fileRouter.get('/shared/permission', getUserFilePermission);

export default fileRouter;