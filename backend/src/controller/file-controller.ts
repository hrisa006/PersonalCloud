import { NextFunction, Request, Response } from "express";
import FileService from "../service/file-service";
import path from "path";
import { Console } from "console";

const fileService = new FileService();

export const fileUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const uploadResult = await fileService.fileUpload(userId, req);
    return res.status(200).json(uploadResult);
  } catch (err) {
    return next(err);
  }
};

export const createFolder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await fileService.createFolder(userId, req);

    res.status(201).send("Folder created successfully");
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const updateResult = await fileService.updateFile(userId, req);

    return res.status(200).json(updateResult);
  } catch (err) {
    return next(err);
  }
};

export const fileRemove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await fileService.removeFile(userId, req);
    res.status(200).send("File deleted successfully");
  } catch (err) {
    return next(err);
  }
};

export const fileGet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const internalFilePath = await fileService.getFilePath(userId, req);
    res.download(internalFilePath, path.basename(internalFilePath), (err) => {
      if (err) throw Error(err.message);
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await fileService.shareFileWithUser(userId, req);
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await fileService.getFilesSharedWithUser(userId);
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await fileService.getUsersFileIsSharedWith(userId, req);
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await fileService.updateSharedPermission(userId, req);
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
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await fileService.unshareFile(userId, req);
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
    const userId = (req as any).userId;
    const filePath = (req.query.filePath as string) ?? "";
    const ownerId = (req.query.ownerId as string) ?? "";
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await fileService.getUserFilePermission(
      ownerId,
      userId,
      filePath
    );
    return res.status(200).json(result);
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

    const fileName = req.query.fileName as string;
    const tree = await fileService.searchFiles(userId, fileName);
    res.status(200).json(tree);
  } catch (error) {
    next(error);
  }
};
