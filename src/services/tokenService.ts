import jwt from 'jsonwebtoken';
import { IUser } from '../interfaces';
import { AppError } from '../utils/appError.js';
import { config } from '../utils/configVar.js';
import { HydratedDocument } from 'mongoose';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

export class TokenService {
  private static get accessTokenSecret(): string {
    const secret = config.jwtSecret;

    if (!secret) {
      throw AppError.Internal('JWT_SECRET is not configured.');
    }

    return secret;
  }

   private static get refreshTokenSecret(): string {
    const secret = config.jwtRefreshSecret;

    if (!secret) {
      throw AppError.Internal('JWT_REFRESH_SECRET is not configured.');
    }

    return secret;
  }


  private static buildPayload(user: HydratedDocument<IUser>): JwtPayload {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  static generateAccessToken(user: HydratedDocument<IUser>): string {
    return jwt.sign(this.buildPayload(user), this.accessTokenSecret, {
      expiresIn: config.jwtExpiresIn ?? '15m',
    });
  }

  static generateRefreshToken(user: HydratedDocument<IUser>): string {
    return jwt.sign(this.buildPayload(user), this.refreshTokenSecret, {
      expiresIn: config.jwtRefreshExpiresIn ?? '7d',
    });
  }

  static generateTokenPair(user: HydratedDocument<IUser>): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
  }

  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.refreshTokenSecret) as JwtPayload;
  }
}