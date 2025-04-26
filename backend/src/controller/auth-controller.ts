import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { BadRequestError } from '../errors/bad-request-error';

const users = [
    {
        email:'user@example.com';
        password: bcrypt.hashSync('password123', 10),
        verified: true,
    },
];

const generateToken = (email : string) => {
    return jwt.sign({email}, ProcessingInstruction.env.JWT_SECRET!, {expiresIn: '1h'});
};

export const register = async (req : Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          throw new BadRequestError('Email and password are required');
        }
    
        const existingUser = users.find((user) => user.email === email);
        if (existingUser) {
          throw new BadRequestError('Email already registered');
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
    
        users.push({
          email,
          password: hashedPassword,
          verified: true,
        });
    
        const token = generateToken(email);
    
        return res.status(201).json({
          message: 'User registered successfully',
          email,
          token,
        });
      } catch (err) {
        next(err);
      }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        throw new BadRequestError('Email and password are required');
      }
  
      const user = users.find((user) => user.email === email);
      if (!user) {
        throw new BadRequestError('Invalid credentials');
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials');
      }
  
      const token = generateToken(email);
  
      return res.status(200).json({
        message: 'Login successful',
        email,
        token,
      });
    } catch (err) {
      next(err);
    }
  };