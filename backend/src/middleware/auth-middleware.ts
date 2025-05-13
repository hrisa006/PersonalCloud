import { Request, Response, NextFunction } from "express";
import { userService } from "../service/user-service";  

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(' ')[1];
    if (!token || !userService.isValidToken(token)) {  
        return res.status(401).json({ message: "Invalid token" });
    }
    const email = userService.getEmailByToken(token);  
    if (!email) {
        return res.status(401).json({ message: "Invalid token" });
    }
    (req as any).userEmail = email;  
    next();
}
