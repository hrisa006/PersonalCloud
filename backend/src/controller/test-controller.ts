import { Request, Response } from 'express';

export const test = (req: Request, res: Response) => {
    res.json([{ 'test': 'test' }]);
};