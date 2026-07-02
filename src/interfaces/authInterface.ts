export interface IUser {
  username: string;
  email: string;
  password: string;
  refreshTokenHash?: string | null;

  isVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareRefreshToken(candidateRefreshToken: string): Promise<boolean>;
}
