class FileUploadResponseDto {
    constructor(message: string, path: string, fileType: string, createdAt: Date, updatedAt: Date) {
        this.message = message;
        this.path = path;
        this.fileType = fileType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    message: string;
    path: string;
    fileType: string;
    createdAt: Date;
    updatedAt: Date;
}