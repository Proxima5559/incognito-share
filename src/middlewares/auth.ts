import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services';
import { AppError } from '../utils/appError.js';

export async function auth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw AppError.Unauthorized('Authorization token missing or malformed.');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw AppError.Unauthorized('Token missing from authorization header.');
        }

        const payload = TokenService.verifyAccessToken(token);

        req.user = payload;

        next();
    } catch (error) {
        if (error instanceof Error) {
            return next(AppError.Unauthorized('Invalid or expired access token.'));
        }

        next(error);
    }
}