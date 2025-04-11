import { Request, Response } from 'express';
import {BadRequestError} from "../errors/bad-request-error";

export const test = (req: Request, res: Response) => {
    res.json([{ 'test': 'test' }]);
};