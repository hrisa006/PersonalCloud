import {NextFunction, Request, Response} from 'express';
import FileService from '../service/file-service';

const fileService = new FileService();

export const fileUpload = (req: Request, res: Response, next: NextFunction) => {
    try {
        fileService.fileUpload(req, res);
    } catch (err) {
        return next(err);
    }
};

export const fileUpdate = (req: Request, res: Response, next: NextFunction) => {
    try {
        fileService.updateFile(req, res);
    } catch (err) {
        return next(err);
    }
};

export const fileRemove = (req: Request, res: Response, next: NextFunction) => {
    try {
        fileService.removeFile(req, res);
    } catch (err) {
        return next(err);
    }
};

export const fileGet = (req: Request, res: Response, next: NextFunction) => {
    try {
        fileService.getFile(req, res);
    } catch (err) {
        return next(err);
    }
};