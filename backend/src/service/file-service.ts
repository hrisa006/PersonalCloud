import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import busboy from 'busboy';
import { BadRequestError } from '../errors/bad-request-error';
import { FileRepository } from '../repository/file-repository';
import { File } from '@prisma/client';

const DIR_BACK_LEVELS = 3;
const STORAGE_DIR = 'uploads';
const FINISH = 'finish';
const FILE = 'file';
const CLOSE = 'close';
const ERROR = 'error';

export default class FileService {
    private fileRepo: FileRepository;
    private static DEFAULT_USER_ID = 'f3844740-6e57-49ed-80f8-8adf16970bc8'; // You may replace this with actual auth later

    constructor() {
        this.fileRepo = new FileRepository();
    }

    public async fileUpload(req: Request): Promise<FileUploadResponseDto> {
        const reqFilePath = req.query.filePath as string ?? '';
        const userId = FileService.DEFAULT_USER_ID;

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('Invalid file path');

        const result = await this.handleBusboyFileUpload(userId + '/' + reqFilePath, req);

        result.path = result.path.split('/').slice(1).join('/');
        await this.fileRepo.createFile({
            userId,
            path: result.path,
            fileType: result.fileType,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
        });

        return result;
    }

    public getFilePath(req: Request): string {
        const reqFilePath = req.query.filePath as string ?? '';
        const userId = FileService.DEFAULT_USER_ID;
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, userId, reqFilePath);

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');
        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('Invalid file path');

        return internalFilePath;
    }

    public async updateFile(req: Request): Promise<FileUploadResponseDto> {
        const reqFilePath = req.query.filePath as string ?? '';
        const userId = FileService.DEFAULT_USER_ID;

        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('Invalid file path');

        await this.removeFile(req, false);

        const result = await this.handleBusboyFileUpload(path.dirname(userId + '/' + reqFilePath), req);
        result.path = result.path.split('/').slice(1).join('/');

        await this.fileRepo.updateFile(req.query.filePath as string, userId, {
            updatedAt: result.updatedAt,
            path: result.path
        });

        return result;
    }

    public async removeFile(req: Request, deleteFromDb: Boolean = true): Promise<void> {
        const reqFilePath = req.query.filePath as string ?? '';
        const userId = FileService.DEFAULT_USER_ID;
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, userId, reqFilePath);

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');
        if (!this.validatePath(reqFilePath))
            throw new BadRequestError('Invalid file path');

        fs.rmSync(internalFilePath);

        if(deleteFromDb)
            await this.fileRepo.deleteFile(reqFilePath, userId);
    }

    public async getUserFileTree(userId: string): Promise<FileItemDto> {
        const files = await this.fileRepo.getFilesOwnedByUser(userId);
        return this.buildFileTree(files);
    }

    private handleBusboyFileUpload(filePath: string, req: Request): Promise<FileUploadResponseDto> {
        return new Promise((resolve, reject) => {
            const bb = busboy({ headers: req.headers });
            let filePathResponse = '';

            bb.on(FILE, (fieldname: string, file: NodeJS.ReadableStream, filename: FileNameBb) => {
                const savedFile = path.join(this.getUploadPath(filePath), filename.filename);
                filePathResponse = path.join(filePath, filename.filename);
                this.processFile(filename, savedFile, file);
            });

            bb.on(FINISH, () =>
                resolve({
                    message: 'Upload complete',
                    path: filePathResponse,
                    fileType: path.extname(filePathResponse),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            );

            bb.on(ERROR, (err: any) => reject(new BadRequestError(err.message || 'Error in file upload')));

            req.pipe(bb);
        });
    }

    private processFile(filename: FileNameBb, fileToSave: string, file: NodeJS.ReadableStream) {
        if (!filename) throw new BadRequestError('Invalid filename during upload');

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

    private buildFileTree(files: { path: string, fileType: string, createdAt: Date, updatedAt: Date }[]): FileItemDto {
        const root: FileItemDto = {
            name: 'root',
            type: 'folder',
            ext: '',
            createdAt: '',
            updatedAt: '',
            path: '',
            items: []
        };

        for (const file of files) {
            const parts = file.path.split('/');
            let current = root;
            let currentPath = '';

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isFile = i === parts.length - 1;
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                if (!current.items) current.items = [];
                let next = current.items.find(item => item.name === part);
                if (!next) {
                    next = {
                        name: part,
                        type: isFile ? 'file' : 'folder',
                        ext: isFile ? file.fileType : '',
                        createdAt: isFile ? file.createdAt.toISOString() : '',
                        updatedAt: isFile ? file.updatedAt.toISOString() : '',
                        path: currentPath,
                        ...(isFile ? {} : { items: [] })
                    };
                    current.items.push(next);
                }

                current = next;
            }
        }

        return root;
    }
}