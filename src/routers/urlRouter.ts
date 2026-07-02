import { Router } from 'express';
import { createURL, getURL } from '../controllers/urlGenController.js';
import { urlGetLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validation/urlGenValidator.js';
import { createUrlGenSchema } from '../middlewares/schemes/index.js';
import { auth } from '../middlewares/auth.js';

const URLRouter = Router();

URLRouter.post('/create', auth, validate(createUrlGenSchema), createURL);
URLRouter.get('/:shortId', urlGetLimiter, getURL);

export default URLRouter;