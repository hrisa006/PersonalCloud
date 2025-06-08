import type { File, SharedFiles, Users } from '@prisma/client';
import { PrismaClient, Prisma, PermissionType } from '@prisma/client';
import { BadRequestError } from '../errors/bad-request-error';

export class FileRepository {
  prisma: PrismaClient = new PrismaClient({ log: ['query', 'info'] });

  private handlePrismaError(error: any, operation: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`[${operation}] PrismaClientKnownRequestError`, error.stack);

      switch (error.code) {
        case 'P2002':
          throw new BadRequestError(`Record already exists during ${operation}`);
        case 'P2003':
          throw new BadRequestError(`Foreign key constraint error during ${operation}`);
        case 'P2004':
          throw new BadRequestError(`Database constraint error during ${operation}`);
        case 'P2025':
          throw new BadRequestError(`Record not found during ${operation}`);
        case 'P2010':
          throw new BadRequestError(`Raw query failed during ${operation}`);
        case 'P2011':
          throw new BadRequestError(`Null constraint violation during ${operation}`);
        case 'P2012':
          throw new BadRequestError(`Missing required field during ${operation}`);
        case 'P2013':
          throw new BadRequestError(`Missing required argument during ${operation}`);
        case 'P2014':
          throw new BadRequestError(`Related record not found during ${operation}`);
        case 'P2015':
          throw new BadRequestError(`Record not found during ${operation}`);
        default:
          throw new BadRequestError(`Database error during ${operation}: ${error.message}`);
      }
    }

    console.error(`[${operation}] Unknown Error`, error.stack);
    throw new BadRequestError(`Unexpected error during ${operation}`);
  }

  async createFile(data: { userId: string; path: string; fileType: string; createdAt: Date; updatedAt: Date; }): Promise<File> {
    try {
      return await this.prisma.file.create({ data });
    } catch (error: any) {
      this.handlePrismaError(error, 'createFile');
    }
  }

  async updateFile(path: string, userId: string, updates: Partial<File>): Promise<File> {
    try {
      return await this.prisma.file.update({
        where: {
          path_userId: { path, userId }
        },
        data: updates,
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'updateFile');
    }
  }

  async deleteFile(path: string, userId: string): Promise<File> {
    try {
      return await this.prisma.file.delete({
        where: {
          path_userId: { path, userId }
        }
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'deleteFile');
    }
  }

  async getFile(path: string, userId: string): Promise<File | null> {
    try {
      return await this.prisma.file.findUnique({
        where: {
          path_userId: { path, userId }
        }
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'getFile');
    }
  }

  async shareFileWithUser(filePath: string, ownerId: string, userId: string, permission: PermissionType): Promise<SharedFiles> {
    try {
      return await this.prisma.sharedFiles.create({
        data: { filePath, ownerId, userId, permissions: permission }
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'shareFileWithUser');
    }
  }

  async getFilesSharedWithUser(userId: string): Promise<(File & { owner: { id: string; name: string; email: string }; permissions: PermissionType })[]> {
    try {
      const shared = await this.prisma.sharedFiles.findMany({
        where: { userId },
        include: {
          file: {
            include: {
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return shared.map(s => ({
        ...s.file,
        permissions: s.permissions
      }));
    } catch (error: any) {
      this.handlePrismaError(error, 'getFilesSharedWithUser');
    }
  }

  async getUsersFileIsSharedWith(filePath: string, ownerId: string): Promise<Users[]> {
    try {
      const shared = await this.prisma.sharedFiles.findMany({
        where: { filePath, ownerId },
        include: { user: true },
      });

      return shared.map((s) => s.user!);
    } catch (error: any) {
      this.handlePrismaError(error, 'getUsersFileIsSharedWith');
    }
  }

  async updateSharedPermission(filePath: string, ownerId: string, userId: string, permission: PermissionType): Promise<SharedFiles> {
    try {
      return await this.prisma.sharedFiles.update({
        where: {
          filePath_ownerId_userId: { filePath, ownerId, userId },
        },
        data: { permissions: permission },
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'updateSharedPermission');
    }
  }

  async unshareFile(filePath: string, ownerId: string, userId: string): Promise<SharedFiles> {
    try {
      return await this.prisma.sharedFiles.delete({
        where: {
          filePath_ownerId_userId: { filePath, ownerId, userId },
        },
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'unshareFile');
    }
  }

  async getFilesOwnedByUser(userId: string): Promise<File[]> {
    try {
      return await this.prisma.file.findMany({
        where: { userId },
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'getFilesOwnedByUser');
    }
  }

  async getUserFilePermission(filePath: string, ownerId: string, userId: string): Promise<SharedFiles | null> {
    try {
      return await this.prisma.sharedFiles.findUnique({
        where: {
          filePath_ownerId_userId: { filePath, ownerId, userId },
        },
      });
    } catch (error: any) {
      this.handlePrismaError(error, 'getUserFilePermission');
    }
  }

  public async userOwnsFile(userId: string, filePath: string): Promise<boolean> {
    try {
      const file = await this.prisma.file.findFirst({
        where: {
          userId: userId,
          path: filePath,
        }
      });

      return !!file;
    } catch (error: any) {
      this.handlePrismaError(error, 'userOwnsFile');
    }
  }
}