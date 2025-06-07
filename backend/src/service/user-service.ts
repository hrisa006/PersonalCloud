import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {UserRegisterDto} from "../dto/user-register-dto";
import {UserLoginDto} from "../dto/user-login-dto";
import {authRepository} from "../repository/auth-repository";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

class UserService {

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

    return jwt.sign(
        {userId: user.id, email: user.email},
        JWT_SECRET
    );
  }

  isValidToken(token: string): boolean {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch (err) {
      return false;
    }
  }

  getEmailByToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      if (!payload.email) {
        throw new Error("Token payload missing email");
      }

      return payload.email;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  }

  getUserIdByToken(token: string): string {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

      if (!payload.userId) {
        throw new Error("Token payload missing userId");
      }

      return payload.userId;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  }

  async getUserByEmail(email: string) {
    return authRepository.findUserByEmail(email);
  }

  async getUserById(id: string) {
    return authRepository.findUserById(id);
  }
}

export const userService = new UserService();