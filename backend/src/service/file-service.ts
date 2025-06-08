import fs from 'fs';
import path from 'path';
import { Request } from 'express';
import busboy from 'busboy';
import { BadRequestError } from '../errors/bad-request-error';
import { FileRepository } from '../repository/file-repository';
import { authRepository } from '../repository/auth-repository';
import { File, SharedFiles, Users, PermissionType } from '@prisma/client';

const DIR_BACK_LEVELS = 3;
const STORAGE_DIR = 'tmp/uploads';
const FINISH = 'finish';
const FILE = 'file';
const CLOSE = 'close';
const ERROR = 'error';

export default class FileService {
    private fileRepo: FileRepository;
    constructor() {
        this.fileRepo = new FileRepository();
    }

    public async fileUpload(userId: string, req: Request): Promise<FileUploadResponseDto> {
        const reqFilePath = req.query.filePath as string ?? '';

        this.validatePath(reqFilePath);

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

     public async searchFilesByName(req: Request): Promise<string[]> {
    const fileName = req.query.fileName as string;

    if (!fileName || fileName.trim() === "")
      throw new BadRequestError("File name is required");

    this.validatePath(fileName);

    const matchingFiles =  await this.fileRepo.searchFilesWithPermission(
        fileName,
        (req.query.ownerId as string) ?? '',
    );

    return matchingFiles.map((f) => f.path);
  }

    public async createFolder(userId: string, req: Request): Promise<void> {
        const reqFolderPath = req.query.folderPath as string ?? '';

        this.validatePath(reqFolderPath);

        const folderInternalPath = path.join(this.getRootPath(), STORAGE_DIR, userId, reqFolderPath);

        if (fs.existsSync(folderInternalPath)) {
            throw new BadRequestError('Folder already exists');
        }

        fs.mkdirSync(folderInternalPath, { recursive: true });

        await this.fileRepo.createFile({
            userId,
            path: reqFolderPath,
            fileType: 'folder',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /*
     * If the ownerId is passed as part of the request we are treating the file as shared
     * All operations like getting the file path or reading from the db are done with the ownerId in this case.
     *
     * If the ownerId is null we use the userId for building the file path and reading the db
     */
    public async getFilePath(userId: string, req: Request): Promise<string> {
        const reqFilePath = req.query.filePath as string ?? '';
        const ownerId = req.query.ownerId as string ?? '';
        await this.assertCanReadFile(userId, reqFilePath, ownerId);


        const internalFilePath = this.getInternalFilePathByOwner(ownerId, userId, reqFilePath)
        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');

        this.validatePath(reqFilePath);

        return internalFilePath;
    }

    /*
     * If the ownerId is passed as part of the request we are treating the file as shared
     * All operations like getting the file path or reading from the db are done with the ownerId in this case.
     *
     * If the ownerId is null we use the userId for building the file path and reading the db
     */
    public async updateFile(userId: string, req: Request): Promise<FileUploadResponseDto> {
        const reqFilePath = req.query.filePath as string ?? '';
        const newPath = req.query.newPath as string ?? '';
        const ownerId = req.query.ownerId as string ?? '';

        this.validatePath(reqFilePath);
        this.validatePath(newPath);

        await this.assertCanWriteFile(userId, reqFilePath, ownerId);
        await this.removeFile(userId, req, false);

        const result = await this.handleBusboyFileUpload(path.dirname((ownerId === '' ? userId : ownerId) + '/' + newPath), req);
        result.path = result.path.split('/').slice(1).join('/');

        await this.fileRepo.updateFile(req.query.filePath as string, ownerId === '' ? userId : ownerId, {
            updatedAt: result.updatedAt,
            path: result.path
        });

        return result;
    }

    /*
     * If the ownerId is passed as part of the request we are treating the file as shared
     * All operations like getting the file path or reading from the db are done with the ownerId in this case.
     *
     * If the ownerId is null we use the userId for building the file path and reading the db
     */
    public async removeFile(userId: string, req: Request, deleteFromDb: boolean = true): Promise<void> {
        const reqFilePath = req.query.filePath as string ?? '';
        const ownerId = req.query.ownerId as string ?? '';

        await this.assertCanWriteFile(userId, reqFilePath, ownerId);

        const internalFilePath = this.getInternalFilePathByOwner(ownerId, userId, reqFilePath)

        if (!fs.existsSync(internalFilePath))
            throw new BadRequestError('File does not exist');

        this.validatePath(reqFilePath);

        fs.rmSync(internalFilePath);

        if (deleteFromDb)
            await this.fileRepo.deleteFile(reqFilePath, ownerId === '' ? userId : ownerId);
    }

    public async getUserFileTree(userId: string): Promise<FileItemDto> {
        const files = await this.fileRepo.getFilesOwnedByUser(userId);
        return this.buildFileTree(files);
    }

    public async shareFileWithUser(ownerId: string, req: Request): Promise<SharedFiles> {
        const { filePath, userEmail, permission } = req.body;

        this.validatePath(filePath);
        this.validateUserId(ownerId);
        this.validateUserId(userEmail);
        this.validatePermission(permission);
        const user = await authRepository.findUserByEmail(userEmail);
        if (!user)
            throw new BadRequestError("User with this email couldn't be found");
        if (user.id === ownerId)
            throw new BadRequestError("User can't share a file with himself");
        return this.fileRepo.shareFileWithUser(filePath, ownerId, user.id, permission);
    }

    public async getFilesSharedWithUser(userId: string): Promise<File[]> {
        this.validateUserId(userId);

        return this.fileRepo.getFilesSharedWithUser(userId);
    }

    public async getUsersFileIsSharedWith(ownerId: string, req: Request): Promise<Users[]> {
        const filePath = req.query.filePath as string ?? '';

        this.validatePath(filePath);
        this.validateUserId(ownerId);

        return this.fileRepo.getUsersFileIsSharedWith(filePath, ownerId);
    }

    public async updateSharedPermission(ownerId: string, req: Request): Promise<SharedFiles> {
        const { filePath, userId, permission } = req.body;

        this.validatePath(filePath);
        this.validateUserId(ownerId);
        this.validateUserId(userId);
        this.validatePermission(permission);

        return this.fileRepo.updateSharedPermission(filePath, ownerId, userId, permission);
    }

    public async unshareFile(ownerId: string, req: Request): Promise<SharedFiles> {
        const { filePath, userId } = req.body;

        this.validatePath(filePath);
        this.validateUserId(ownerId);
        this.validateUserId(userId);

        return this.fileRepo.unshareFile(filePath, ownerId, userId);
    }

    public async getUserFilePermission(ownerId: string, userId: string, filePath: string): Promise<SharedFiles | null> {
        this.validatePath(filePath);
        this.validateUserId(ownerId);
        this.validateUserId(userId);

        return this.fileRepo.getUserFilePermission(filePath, ownerId, userId!);
    }

    private async assertCanReadFile(userId: string, filePath: string, ownerId: string): Promise<void> {
        this.validateUserId(userId);
        this.validatePath(filePath);

        if (await this.fileRepo.userOwnsFile(userId, filePath)) {
            return;
        }
        const permission = await this.getUserFilePermission(ownerId, userId, filePath);
        if (!permission || (permission.permissions !== PermissionType.READ && permission.permissions !== PermissionType.WRITE)) {
            throw new BadRequestError('User does not have read permission for this file');
        }
    }

    private async assertCanWriteFile(userId: string, filePath: string, ownerId: string): Promise<void> {
        this.validateUserId(userId);
        this.validatePath(filePath);
        if (await this.fileRepo.userOwnsFile(userId, filePath)) {
            return;
        }

        const permission = await this.getUserFilePermission(ownerId, userId, filePath);
        if (!permission || permission.permissions !== PermissionType.WRITE) {
            throw new BadRequestError('User does not have write permission for this file');
        }
    }

    private validateUserId(userId: string | undefined): void {
        if (!userId || userId.trim() === '') {
            throw new BadRequestError('Invalid userId');
        }
    }

    private validatePermission(permission: string): void {
        if (!Object.values(PermissionType).includes(permission as PermissionType)) {
            throw new BadRequestError('Invalid permission value');
        }
    }

    private validatePath(filePath: string): void {
        if ((filePath.includes('..') || filePath.includes('\\')))
            throw new BadRequestError('Invalid file path');
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
                const isFile = i === parts.length - 1 && file.fileType !== 'folder';
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

    private getInternalFilePathByOwner(ownerId: string, userId: string, reqFilePath: string) {
        return (ownerId === '') ?
            path.join(this.getRootPath(), STORAGE_DIR, userId, reqFilePath) :
            path.join(this.getRootPath(), STORAGE_DIR, ownerId, reqFilePath);
    }

}