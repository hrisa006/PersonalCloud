import { Router } from 'express';
import {
    fileUpload, fileGet, fileUpdate, fileRemove, getFilesSharedWithUser, getUserFilePermission,
    getUserFileTree, getUsersFileIsSharedWith, shareFileWithUser, unshareFile, updateSharedPermission, createFolder
} from '../controller/file-controller';
import { authMiddleware } from "../middleware/auth-middleware";

const fileRouter = Router();

fileRouter.post('/', authMiddleware, fileUpload);
fileRouter.get('/', authMiddleware, fileGet);
fileRouter.delete('/', authMiddleware, fileRemove);
fileRouter.put('/', authMiddleware, fileUpdate);

fileRouter.post('/folder', authMiddleware, createFolder);
fileRouter.get('/user/tree', authMiddleware, getUserFileTree);

fileRouter.post('/share', authMiddleware, shareFileWithUser);
fileRouter.get('/shared', authMiddleware, getFilesSharedWithUser);
fileRouter.delete('/shared', authMiddleware, unshareFile);
fileRouter.get('/shared/users', authMiddleware, getUsersFileIsSharedWith);
fileRouter.put('/shared/permission', authMiddleware, updateSharedPermission);
fileRouter.get('/shared/permission', authMiddleware, getUserFilePermission);

export default fileRouter;