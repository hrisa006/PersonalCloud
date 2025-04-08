import { Request, Response } from 'express';
import FileService from '../service/file-service';

const fileService = new FileService();

export const fileUpload = (req: Request, res: Response) => fileService.fileUpload(req, res);

export const fileUpdate = (req: Request, res: Response) => fileService.updateFile(req, res);

export const fileRemove = (req: Request, res: Response) => fileService.removeFile(req, res);

export const fileGet = (req: Request, res: Response) => fileService.getFile(req, res);