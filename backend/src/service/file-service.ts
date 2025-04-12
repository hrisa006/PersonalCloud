import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import busboy from 'busboy';
import {BadRequestError} from '../errors/bad-request-error';

const DIR_BACK_LEVELS = 3;
const STORAGE_DIR = 'uploads';
const FINISH = 'finish';
const FILE = 'file';
const CLOSE = 'close';
const ERROR = 'error';

export default class FileService {
    public fileUpload(req: Request): Promise<FileUploadResponseDto> {
        const reqFilePath = req.query.filePath as string ?? '';

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('Invalid file path');

        return this.handleBusboyFileUpload(reqFilePath, req);
    }

    public getFilePath(req: Request): string {
        const reqFilePath = req.query.filePath as string ?? '';
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('There was an error parsing the file');

        return internalFilePath;
    }

    public updateFile(req: Request): Promise<FileUploadResponseDto> {
        let reqFilePath = req.query.filePath as string ?? '';
        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('There was an error parsing the file');

        this.removeFile(req);
        return this.handleBusboyFileUpload(path.dirname(reqFilePath), req);
    }

    public removeFile(req: Request): void {
        const reqFilePath = req.query.filePath as string ?? '';
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('There was an error deleting the file');

        fs.rm(internalFilePath, (err) => {
            if (err) throw Error(err.message);
        });
    }

    public searchFilesByName(req: Request): string[] {
        const fileName = req.query.fileName as string;
        
        if (!fileName || fileName.trim() === '')
            throw new BadRequestError('File name is required');
            
        if (!this.validatePath(fileName))
            throw new BadRequestError('Invalid file name');
            
        const rootStoragePath = path.join(this.getRootPath(), STORAGE_DIR);
        const results: string[] = [];
        
        const searchDirectory = (dirPath: string) => {
            if (!fs.existsSync(dirPath)) return;
            
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const stats = fs.statSync(fullPath);
                
                if (stats.isDirectory()) {
                    searchDirectory(fullPath);
                } else if (item.toLowerCase().includes(fileName.toLowerCase())) {
                    const relativePath = path.relative(rootStoragePath, fullPath);
                    results.push(relativePath);
                }
            }
        };
        
        searchDirectory(rootStoragePath);
        return results;
    }

    private handleBusboyFileUpload(filePath: string, req: Request): Promise<FileUploadResponseDto> {
        return new Promise((resolve, reject) => {
            const bb = busboy({ headers: req.headers });
            let filePathResponse = '';

            bb.on(FILE, (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) => {
                const savedFile = path.join(this.getUploadPath(filePath), filename.filename);
                filePathResponse = path.join(filePath, filename.filename);
                this.processFile(filename, savedFile, file);
            });

            bb.on(FINISH, () => resolve({
                    message: 'Upload complete', path: filePathResponse, fileType: path.extname(filePathResponse),
                    createdAt: new Date(), updatedAt: new Date()}));

            bb.on(ERROR, (err: any) => reject(new BadRequestError(err.message || 'Error in file upload')));

            req.pipe(bb);
        });
    }

    private processFile(filename: FileName, fileToSave: string, file: NodeJS.ReadableStream) {
        if (!filename)
            throw new BadRequestError('There was an error parsing the file');

        console.log(`Uploading file: ${filename.filename} to ${fileToSave}`);
        const writeStream = fs.createWriteStream(fileToSave);
        file.pipe(writeStream);
        writeStream.on(CLOSE, () => console.log(`Finished writing ${filename.filename}`));
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