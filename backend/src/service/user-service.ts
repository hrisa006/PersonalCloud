import { User } from "../model/user-model";

class UserService {
    private users = new Map<string, User>(); // email -> User
    private tokens = new Map<string, string>(); // token -> email

    register(email: string, password: string): boolean {
        if (this.users.has(email)) return false;
        const newUser: User = {
            email,
            password,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(email, newUser);
        return true;
    }

    login(email: string, password: string): string | null {
        const user = this.users.get(email);
        if (!user || user.password !== password) return null;
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
        return this.users.get(email);
    }
}

export const userService = new UserService();
