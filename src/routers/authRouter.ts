import { Router } from 'express';
import AuthController from '../controllers/autController.js';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation/urlGenValidator.js';
import { loginSchema, registerSchema } from '../middlewares/schemes/index.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const userRouter = Router();

userRouter.post('/register', authLimiter, validate(registerSchema), AuthController.register);
userRouter.post('/login', authLimiter, validate(loginSchema), AuthController.login);
userRouter.post('/refresh', AuthController.refresh);
userRouter.post('/logout', auth, AuthController.logout);
userRouter.get('/me', auth, AuthController.me);
userRouter.delete('/delete', auth, AuthController.deleteAccount);

export default userRouter;