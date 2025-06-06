import bcrypt from "bcrypt";
import { UserRegisterDto } from "../dto/user-register-dto";
import { UserLoginDto } from "../dto/user-login-dto";
import { authRepository } from "../repository/auth-repository";

class UserService {
  private tokens = new Map<string, string>(); // token -> email

  async register(dto: UserRegisterDto): Promise<boolean> {
    try {
      const existingUser = await authRepository.findUserByEmail(dto.email);
      if (existingUser) return false;
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      await authRepository.createUser({
        ...dto,
        password: hashedPassword,
      });
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  }

  async login(dto: UserLoginDto): Promise<string | null> {
    const user = await authRepository.findUserByEmail(dto.email);
    if (!user) return null;
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) return null;
    const token = `${dto.email}-${Date.now()}`;
    this.tokens.set(token, dto.email);
    return token;
  }

  isValidToken(token: string): boolean {
    return this.tokens.has(token);
  }

  getEmailByToken(token: string): string | undefined {
    return this.tokens.get(token);
  }

  async getUser(email: string) {
    return authRepository.findUserByEmail(email);
  }
}

export const userService = new UserService();