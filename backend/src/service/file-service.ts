import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import busboy from 'busboy';

const DIR_BACK_LEVELS = 3;
const STORAGE_DIR = 'uploads';
const FINISH = 'finish';
const FILE = 'file';
const CLOSE = 'close';

export default class FileService {
    public fileUpload(req: Request, res: Response) {
        const reqFilePath = req.query.filePath as string ?? '';
        let filePath = '';
        let uploadError: string | null = null;

        this.validatePath(reqFilePath) ? filePath = reqFilePath : uploadError = 'Invalid file path';

        this.handleBusboyFileUpload(uploadError, filePath, res, req);
    }

    public removeFile(req: Request, res: Response) {
       try {
            this.removeFileWithError(req, (err) => {
                if (err)
                    return res.status(500).send(err.message);
                res.status(200).send('File deleted successfully');
            });
        } catch(err: any) {
            return res.status(400).send(err.message);
        }
    }

    public getFile(req: Request, res: Response) {
        const reqFilePath = req.query.filePath as string ?? '';
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);

        if (!fs.existsSync(internalFilePath) || !this.validatePath(internalFilePath)) {
            return res.status(400).send('There was an error parsing the file');
        }

        res.download(internalFilePath, internalFilePath.substring(internalFilePath.indexOf('/')), (err) => {
            if (err) {
                res.status(500).send('Could not download file');
            }
        });
    }

    public updateFile(req: Request, res: Response) {
        let reqFilePath = req.query.filePath as string ?? '';
        let uploadError: string | null = null;
        if (!this.validatePath(reqFilePath))
            return res.status(400).send('There was an error parsing the file');

        try {
            this.removeFileWithError(req, (err) => {
                if (err)
                    return res.status(500).send(err.message);
            });
        } catch(err: any) {
            return res.status(400).send(err.message);
        }

        reqFilePath = reqFilePath.substring(0, reqFilePath.lastIndexOf('/'));
        this.handleBusboyFileUpload(uploadError, reqFilePath, res, req);
    }

    private handleBusboyFileUpload(uploadError: string | null, filePath: string, res: Response, req: Request) {
        const bb = busboy({ headers: req.headers });
        let filePathResponse = '';
        bb.on(FILE, (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) => {
            if (uploadError) {
                file.resume();
                return;
            }
            try {
                this.processFile(filename, path.join(this.getUploadPath(filePath), filename.filename), file);
                filePathResponse = path.join(filePath, filename.filename)
            } catch (err: any) {
                uploadError = err.message;
            }
        });

        bb.on(FINISH, () =>
            uploadError ? res.status(400).send(uploadError) :
                res.status(200).json({message: 'Upload complete', path: filePathResponse,
                    fileType: filePathResponse.substring(filePathResponse.indexOf('.')),
                    createdAt: new Date(), updatedAt: new Date()
                })
        );

        req.pipe(bb);
    }

    private processFile(filename: FileName, fileToSave: string, file: NodeJS.ReadableStream) {
        if (!filename) {
            throw Error('There was an error parsing the file');
        }
        console.log(`Uploading file: ${filename.filename}`);
        const writeStream = fs.createWriteStream(fileToSave);
        file.pipe(writeStream);
        writeStream.on(CLOSE, () => console.log(`Finished writing ${filename.filename}`));
    }


    private removeFileWithError(req: Request, onError: (err: any) => void) {
        const reqFilePath = req.query.filePath as string ?? '';
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);

        if (!fs.existsSync(internalFilePath) || !this.validatePath(internalFilePath)) {
            throw Error('There was an error deleting the file');
        }
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