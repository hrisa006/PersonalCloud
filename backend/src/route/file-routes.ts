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
import {authMiddleware} from "../middleware/auth-middleware";

const fileRouter = Router();

fileRouter.post('/', authMiddleware, fileUpload);
fileRouter.get('/', authMiddleware, fileGet);
fileRouter.delete('/', authMiddleware, fileRemove);
fileRouter.put('/', authMiddleware, fileUpdate);

fileRouter.get('/user/tree', authMiddleware, getUserFileTree);

fileRouter.post('/share', authMiddleware, shareFileWithUser);
fileRouter.get('/shared', authMiddleware, getFilesSharedWithUser);
fileRouter.delete('/shared', authMiddleware, unshareFile);
fileRouter.get('/shared/users', authMiddleware, getUsersFileIsSharedWith);
fileRouter.put('/shared/permission', authMiddleware, updateSharedPermission);
fileRouter.get('/shared/permission', authMiddleware, getUserFilePermission);

export default fileRouter;