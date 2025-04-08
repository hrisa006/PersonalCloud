import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import busboy from 'busboy';

const DIR_BACK_LEVELS = 3;
const STORAGE_DIR = 'uploads';
const FINISH = 'finish';
const FILE = 'file';
const FIELD = 'field';

export default class fileService {
    public fileUpload(req: Request, res: Response) {
        const bb = busboy({headers: req.headers});

        let filePath = '';
        bb.on(FIELD, (fieldname: string, value: string) => filePath = this.processField(fieldname, filePath, value));

        bb.on(FILE, (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) =>
            this.processFile(filename, res, filePath, file));

        bb.on(FINISH, () => res.status(200).send('Upload complete'));
        req.pipe(bb);
    }


    public removeFile(req: Request, res: Response) {
        this.removeFileWithError(req, res, (err) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).send('There was an error deleting the file');
            }
            res.status(200).send('File deleted successfully');
        });
    }

    public getFile(req: Request, res: Response) {
        const reqFilePath = req.query.filePath as string;
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);
        //Add validation so other system files are not accessible only the storage dir
        if (!fs.existsSync(internalFilePath)) {
            res.status(400).send('There was an error parsing the file');
        }

        res.download(internalFilePath, internalFilePath.substring(internalFilePath.indexOf('/')), (err) => {
            if (err) {
                console.error('Download error:', err);
                res.status(500).send('Could not download file');
            }
        });
    }

    public updateFile(req: Request, res: Response) {
        const reqFilePath = req.query.filePath as string;
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);
        //Add validation so other system files are not accessible only the storage dir
        if (!fs.existsSync(internalFilePath)) {
            res.status(400).send('There was an error parsing the file');
        }
        this.removeFileWithError(req, res, (err) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).send('There was an error deleting the file');
            }
        });
        this.fileUpload(req, res);
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

    private processFile(filename: FileName, res: Response, filePath: string, file: NodeJS.ReadableStream) {
        if (!filename) {
            res.status(400).send('There was an error parsing the file');
            return;
        }

        console.log(`Uploading file: ${filename.filename}`);
        const fileToSave = path.join(this.getUploadPath(filePath), filename.filename);

        const writeStream = fs.createWriteStream(fileToSave);

        file.pipe(writeStream);
        writeStream.on('close', () => console.log(`Finished writing ${filename.filename}`));
    }

    private processField(fieldname: string, filePath: string, value: string) {
        //add path validations
        if (fieldname === 'filePath')
            filePath = value;

        return filePath;
    }

    private removeFileWithError(req: Request, res: Response, onError: (err: any) => void) {
        const reqFilePath = req.query.filePath as string;
        const internalFilePath = path.join(this.getRootPath(), STORAGE_DIR, reqFilePath);
        //Add validation so other system files are not accessible only the storage dir
        if (!fs.existsSync(internalFilePath)) {
            res.status(400).send('There was an error parsing the file');
        }
        fs.rm(internalFilePath, onError);
    }

    private validatePath(path: string): boolean {
        return true;
    }
}