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

export const searchFiles = (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = fileService.searchFilesByName(req);
        const status = files.length ? 200 : 404
        const message = files.length > 0 ? `Found ${files.length} files` : 'No files found'
        return res.status(status).json({
            message,
            files: files
        });
    } catch (err) {
        return next(err);
    }
};