import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../utils/configVar.js';
import { IUser } from '../interfaces/index.js';

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    refreshTokenHash: {
        type: String,
        default: null,
    },

    isVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.compareRefreshToken = async function (candidateRefreshToken: string): Promise<boolean> {
  if (!this.refreshTokenHash) {
    return false;
  }

  return bcrypt.compare(candidateRefreshToken, this.refreshTokenHash);
};

export const UserModel = model<IUser>('User', UserSchema);