import type { File, SharedFiles, Users } from '@prisma/client';
import { PrismaClient, PermissionType } from '@prisma/client';

export class FileRepository {
  prisma: PrismaClient = new PrismaClient({ log: ['query', 'info'] });

  async createFile(data: { userId: string; path: string; fileType: string; createdAt: Date; updatedAt: Date; }): Promise<File> {
    try {
      return await this.prisma.file.create({ data });
    } catch (error: any) {
      console.error('[ERROR] prisma.file.create failed:', error);
      throw error;
    }
  }

  async updateFile(path: string, userId: string, updates: Partial<File>): Promise<File> {
    return this.prisma.file.update({
      where: {
        path_userId: { path, userId }
      },
      data: updates,
    });
  }

  async deleteFile(path: string, userId: string): Promise<File> {
    return this.prisma.file.delete({
      where: {
        path_userId: { path, userId }
      }
    });
  }

  async getFile(path: string, userId: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: {
        path_userId: { path, userId }
      }
    });
  }

  async shareFileWithUser(filePath: string, ownerId: string, userId: string, permission: PermissionType): Promise<SharedFiles> {
    return this.prisma.sharedFiles.create({
      data: {filePath, ownerId, userId, permissions: permission}
    });
  }

  async getFilesSharedWithUser(userId: string): Promise<File[]> {
    const shared = await this.prisma.sharedFiles.findMany({
      where: { userId },
      include: {
        file: {include: {owner: {
              select: {
                id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return shared.map(s => ({...s.file, permissions: s.permissions}));
  }

  async getUsersFileIsSharedWith(filePath: string, ownerId: string): Promise<Users[]> {
    const shared = await this.prisma.sharedFiles.findMany({
      where: { filePath, ownerId },
      include: { user: true },
    });

    return shared.map((s) => s.user!);
  }

  async updateSharedPermission(filePath: string, ownerId: string, userId: string, permission: PermissionType): Promise<SharedFiles> {
    return this.prisma.sharedFiles.update({
      where: {
        filePath_ownerId_userId: { filePath, ownerId, userId },
      },
      data: { permissions: permission },
    });
  }

  async unshareFile(filePath: string, ownerId: string, userId: string): Promise<SharedFiles> {
    return this.prisma.sharedFiles.delete({
      where: {
        filePath_ownerId_userId: { filePath, ownerId, userId },
      },
    });
  }

  async getFilesOwnedByUser(userId: string): Promise<File[]> {
    return this.prisma.file.findMany({
      where: { userId },
    });
  }

  async getUserFilePermission(filePath: string, ownerId: string, userId: string): Promise<SharedFiles | null> {
    return this.prisma.sharedFiles.findUnique({
      where: {
        filePath_ownerId_userId: { filePath, ownerId, userId },
      },
    });
  }

  public async userOwnsFile(userId: string, filePath: string): Promise<boolean> {
    const file = await this.prisma.file.findFirst({
      where: {
        userId: userId,
        path: filePath,
      }
    });

    return !!file;
  }
}