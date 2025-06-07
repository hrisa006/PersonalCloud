import { Request, Response } from "express";
import { userService } from "../service/user-service";  

export const register = async (req: Request, res: Response) => {
    try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const success = await userService.register({email, password}); 
    
    if (!success) {
        return res.status(409).json({ message: 'User already exists' });
    }
    res.cookie('token', email, {
        maxAge: 3600000, 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict', // Adjusted to lower case for valid TypeScript type
    });  

    return res.status(201).json({ message: 'Registered successfully' });
    } catch (error) {
        console.error('Registration failed:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const token = await userService.login({email, password});

    if (!token) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.cookie('token', token, {
        maxAge: 3600000, 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Set to true in production
        sameSite: 'strict', // Adjusted to lower case for valid TypeScript type
    });  

    return res.status(200).json({ token });
};
