import type { JwtPayload } from '../src/services/tokenService.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}