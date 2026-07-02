import { Router } from 'express';
import userRouter from './authRouter.js';
import URLRouter from './urlRouter.js';

const masterRouter = Router();

masterRouter.use('/auth', userRouter);
masterRouter.use('/urls', URLRouter);

export default masterRouter;