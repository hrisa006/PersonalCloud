import { Request, Response, NextFunction } from 'express';
import {BadRequestError} from "../errors/bad-request-error";

export function badRequestErrorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof BadRequestError) {
        console.error(err.message);
        res.status(400).json({error: 'Bad Request', message: err.message,});
    }
    else {
        next(err);
    }

}

export function globalExceptionHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
}