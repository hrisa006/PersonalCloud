import { NextFunction, Request, Response } from "express";
import FileService from "../service/file-service";
import path from "path";

const fileService = new FileService();

export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const uploadResult = await fileService.fileUpload(req);
    return res.status(200).json(uploadResult);
  } catch (err) {
    return next(err);
  }
};

export const fileUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updateResult = await fileService.updateFile(req);
    return res.status(200).json(updateResult);
  } catch (err) {
    return next(err);
  }
};

export const fileRemove = (req: Request, res: Response, next: NextFunction) => {
  try {
    fileService.removeFile(req);
    res.status(200).send("File deleted successfully");
  } catch (err) {
    return next(err);
  }
};

export const fileGet = (req: Request, res: Response, next: NextFunction) => {
  try {
    const internalFilePath = fileService.getFilePath(req);
    res.download(internalFilePath, path.basename(internalFilePath), (err) => {
      if (err) throw Error(err.message);
    });
  } catch (err) {
    return next(err);
  }
};

export const searchFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const files = await fileService.searchFilesByName(req);
    const status = files.length ? 200 : 404;
    const message =
      files.length > 0 ? `Found ${files.length} files` : "No files found";

    return res.status(status).json({
      message,
      files,
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserFileTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(400).json({ error: "Missing x-user-id header" });
    }
    const tree = await fileService.getUserFileTree(userId);
    res.status(200).json(tree);
  } catch (error) {
    next(error);
  }
};

export const shareFileWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fileService.shareFileWithUser(req);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const getFilesSharedWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fileService.getFilesSharedWithUser(req);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const getUsersFileIsSharedWith = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fileService.getUsersFileIsSharedWith(req);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const updateSharedPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fileService.updateSharedPermission(req);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const unshareFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fileService.unshareFile(req);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};

export const getUserFilePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fileService.getUserFilePermission(req);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
};
