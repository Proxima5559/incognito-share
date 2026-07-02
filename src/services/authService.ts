import bcrypt from 'bcryptjs';
import { UserModel } from '../models';
import { IUser } from '../interfaces';
import { AppError } from '../utils/appError.js';
import { TokenService } from './tokenService.js';
import { HydratedDocument } from 'mongoose';
import { config } from '../utils/configVar.js';

interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

interface LoginUserDto {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse extends AuthTokens {
  user: HydratedDocument<IUser>;
}

export class AuthService {
  static async register(data: RegisterUserDto): Promise<HydratedDocument<IUser>> {
    const { username, email, password } = data;

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw AppError.BadRequest('Username is already taken.');
      }

      throw AppError.BadRequest('Email is already registered.');
    }

    const user = await UserModel.create({
      username,
      email,
      password,
    });

    return user;
  }

  static async login(data: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = data;

    const user = await UserModel.findOne({ email });

    if (!user) {
      throw AppError.BadRequest('Invalid email or password.');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw AppError.BadRequest('Invalid email or password.');
    }

    const { accessToken, refreshToken } = TokenService.generateTokenPair(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, config.bcryptSaltRounds);

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = TokenService.verifyRefreshToken(refreshToken);
    const user = await UserModel.findById(payload.id);

    if (!user || !user.refreshTokenHash) {
      throw AppError.Unauthorized('Invalid refresh token.');
    }

    const isRefreshTokenValid = await user.compareRefreshToken(refreshToken);

    if (!isRefreshTokenValid) {
      throw AppError.Unauthorized('Invalid refresh token.');
    }

    const nextTokens = TokenService.generateTokenPair(user);
    const refreshTokenHash = await bcrypt.hash(nextTokens.refreshToken, config.bcryptSaltRounds);

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return nextTokens;
  }

  static async logout(userId: string): Promise<void> {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw AppError.NotFound('User not found.');
    }

    user.refreshTokenHash = null;
    await user.save();
  }

  static async deleteAccount(userId: string): Promise<void> {
    const user = await UserModel.findByIdAndDelete(userId);

    if (!user) {
      throw AppError.NotFound('User not found.');
    }
  }
}