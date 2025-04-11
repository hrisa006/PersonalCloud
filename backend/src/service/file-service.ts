import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import busboy from 'busboy';
import {BadRequestError} from "../errors/bad-request-error";

const DIR_BACK_LEVELS = 3;
const STORAGE_DIR = 'uploads';
const FINISH = 'finish';
const FILE = 'file';
const CLOSE = 'close';

export default class FileService {
    public fileUpload(req: Request, res: Response) {
        const reqFilePath = req.query.filePath as string ?? '';

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('Invalid file path');

        this.handleBusboyFileUpload(reqFilePath, res, req);
    }

    public removeFile(req: Request, res: Response) {
        this.removeFileWithError(req, (err) => {
            if (err)
                throw Error(err.message);
            res.status(200).send('File deleted successfully');
        });
    }

    public getFile(req: Request, res: Response) {
        const reqFilePath = req.query.filePath as string ?? '';
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('There was an error parsing the file');

         res.download(internalFilePath, path.basename(internalFilePath), (err) => {
            if (err)
                throw Error(err.message);
        });
    }

    public updateFile(req: Request, res: Response) {
        let reqFilePath = req.query.filePath as string ?? '';
        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('There was an error parsing the file');

        this.handleBusboyFileUpload(path.dirname(reqFilePath), res, req);
        this.removeFileWithError(req, (err) => {
            if (err)
                throw Error(err);
        });
    }

    private handleBusboyFileUpload(filePath: string, res: Response, req: Request) {
        const bb = busboy({ headers: req.headers });
        let filePathResponse = '';
        bb.on(FILE, (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) => {
            this.processFile(filename, path.join(this.getUploadPath(filePath), filename.filename), file);
            filePathResponse = path.join(filePath, filename.filename)
        });

        bb.on(FINISH, () =>
            res.status(200).json({message: 'Upload complete', path: filePathResponse,
                fileType: path.extname(filePathResponse), createdAt: new Date(), updatedAt: new Date()})
        );

        req.pipe(bb);
    }

    private processFile(filename: FileName, fileToSave: string, file: NodeJS.ReadableStream) {
        if (!filename)
            throw new BadRequestError('There was an error parsing the file');

        console.log(`Uploading file: ${filename.filename} to ${fileToSave}`);
        const writeStream = fs.createWriteStream(fileToSave);
        file.pipe(writeStream);
        writeStream.on(CLOSE, () => console.log(`Finished writing ${filename.filename}`));
    }


    private removeFileWithError(req: Request, onError: (err: any) => void) {
        const reqFilePath = req.query.filePath as string ?? '';
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('There was an error deleting the file');


        fs.rm(internalFilePath, onError);
    }

    private getRootPath(): string {
        let result = __dirname;
        for (let i = 0; i < DIR_BACK_LEVELS; i++)
            result = path.dirname(result);

        return result;
    }

    private getUploadPath(filePath: string): string {
        const uploadPath = path.join(this.getRootPath(), STORAGE_DIR, filePath);
        if (!fs.existsSync(uploadPath))
            fs.mkdirSync(uploadPath, { recursive: true });

        return uploadPath;
    }

    private validatePath(filePath: string): boolean {
        return !(filePath.includes('..') || filePath.includes('\\'))
    }
}