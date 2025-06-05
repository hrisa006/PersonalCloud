import { User } from "../dto/user-model";
import bcrypt from "bcrypt";

class UserService {
    private users: User[] = [];
    private tokens = new Map<string, string>(); // token -> email

    async register(email: string, password: string): Promise<boolean> {
        if (this.users.some(u => u.email === email)) return false;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser: User = {
            email,
            password: hashedPassword,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.push(newUser);
        return true;
    }

    async login(email: string, password: string): Promise<string | null> {
        const user = this.users.find(u => u.email === email);
        if (!user) return null;
        const match = await bcrypt.compare(password, user.password);
        if (!match) return null;
        const token = `${email}-${Date.now()}`;
        this.tokens.set(token, email);
        return token;
    }

    isValidToken(token: string): boolean {
        return this.tokens.has(token);
    }

    getEmailByToken(token: string): string | undefined {
        return this.tokens.get(token);
    }

    getUser(email: string): User | undefined {
        return this.users.find(u => u.email === email);
    }
}

export const userService = new UserService();
