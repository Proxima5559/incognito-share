import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { AuthService } from '../services/index.js';

export default class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.register(req.body);

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully.',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);

      res.status(200).json({
        status: 'success',
        message: 'Login successful.',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw AppError.BadRequest('Refresh token is required.');
      }

      const tokens = await AuthService.refresh(refreshToken);

      res.status(200).json({
        status: 'success',
        message: 'Tokens refreshed successfully.',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw AppError.Unauthorized('Authentication required.');
      }

      await AuthService.logout(req.user.id);

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.Unauthorized('Authentication required.');
      }

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
  static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.id) {
        throw AppError.Unauthorized('Authentication required.');
      }
      await AuthService.deleteAccount(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}