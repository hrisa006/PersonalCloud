class FileName {
    filename: string;
    encoding: string;
    mimeType: string;

    constructor(filename: string, encoding: string, mimeType: string) {
        this.filename = filename;
        this.encoding = encoding;
        this.mimeType = mimeType;
    }
}