import { Request, Response } from 'express';
import FileService from '../service/file-service';

const fileService = new FileService();

export const fileUpload = (req: Request, res: Response) => {
    fileService.fileUpload(req, res);
};