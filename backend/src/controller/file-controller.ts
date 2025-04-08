import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import busboy from 'busboy';

const storageDir = 'uploads';

function getRootPath(): string {
    const levels = 3;
    let result = __dirname;
    for (let i = 0; i < levels; i++)
        result = path.dirname(result);
    return result;
}


function getUploadPath(filePath: string): string {
    const uploadPath = path.join(getRootPath(), storageDir, filePath);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    return uploadPath;
}

function processFile(filename: FileName, res: e.Response<any, Record<string, any>>, filePath: string, file: NodeJS.ReadableStream) {
    if (!filename) {
        res.status(400).send('There was an error parsing the file');
        return;
    }

    console.log(`Uploading file: ${filename.filename}`);

    const fileToSave = path.join(getUploadPath(filePath), filename.filename);
    const writeStream = fs.createWriteStream(fileToSave);

    file.pipe(writeStream);

    writeStream.on('close', () => {
        console.log(`Finished writing ${filename.filename}`);
    });
}

function processField(fieldname: string, filePath: string, value: string) {
    //add path validations
    if (fieldname === 'filePath') {
        filePath = value;
    }
    return filePath;
}

export const fileUpload = (req: Request, res: Response) => {
    const bb = busboy({ headers: req.headers });
    let filePath = '';
    bb.on('field', (fieldname: string, value: string) => {
        filePath = processField(fieldname, filePath, value);
    });

    bb.on('file',
        (fieldname: string, file: NodeJS.ReadableStream, filename: FileName) => {
            processFile(filename, res, filePath, file);
        });

    bb.on('finish', () => {
        res.status(200).send('Upload complete');
    });

    req.pipe(bb);
};