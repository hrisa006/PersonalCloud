import { PrismaClient } from "@prisma/client";
import type { Users } from '@prisma/client';
import { UserRegisterDto } from "../dto/user-register-dto";

const prisma = new PrismaClient();

export const authRepository = {
  async findUserById(id: string): Promise<Users | null> {
    return prisma.users.findUnique({ where: { id } });
  },

  async findUserByEmail(email: string): Promise<Users | null> {
    return prisma.users.findUnique({ where: { email } });
  },

  async createUser(user: UserRegisterDto): Promise<Users> {
    return prisma.users.create({
      data: {
        email: user.email,
        password: user.password,
        name: user.name ?? user.email,
      },
    });
  },
};