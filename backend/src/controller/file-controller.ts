import {NextFunction, Request, Response} from 'express';
import FileService from '../service/file-service';
import path from "path";

const fileService = new FileService();

export const fileUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const uploadResult = await fileService.fileUpload(req);
        return res.status(200).json(uploadResult);
    } catch (err) {
        return next(err);
    }
};

export const fileUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updateResult = await fileService.updateFile(req);
        return res.status(200).json(updateResult);
    } catch (err) {
        return next(err);
    }
};

export const fileRemove = (req: Request, res: Response, next: NextFunction) => {
    try {
        fileService.removeFile(req);
        res.status(200).send('File deleted successfully');
    } catch (err) {
        return next(err);
    }
};

export const fileGet = (req: Request, res: Response, next: NextFunction) => {
    try {
        const internalFilePath = fileService.getFilePath(req);
        res.download(internalFilePath, path.basename(internalFilePath), (err) => {
            if (err) throw Error(err.message);
        });
    } catch (err) {
        return next(err);
    }
};

export const getUserFileTree = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.header('x-user-id');
        if (!userId) {
            return res.status(400).json({ error: 'Missing x-user-id header' });
        }
        const tree = await fileService.getUserFileTree(userId);
        res.status(200).json(tree);
    } catch (error) {
        next(error);
    }
};