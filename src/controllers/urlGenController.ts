import { Request, Response, NextFunction } from 'express';
import { UrlService } from '../services';
import { AppError } from '../utils/appError.js';

export const createURL = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { label, message, maxViews } = req.body;

    if (!message) {
      return next(AppError.BadRequest('Message content is required, bro.'));
    }

    const newUrlRecord = await UrlService.createShortUrl(label, message, maxViews);

    return res.status(201).json({
      message: 'Short URL created successfully!',
      shortId: newUrlRecord.shortId,
      url: `http://localhost:${process.env.PORT || 3000}/api/v1/urls/${newUrlRecord.shortId}`,
      expiresAt: newUrlRecord.expiresAt,
      maxViews: newUrlRecord.maxViews,
    });

  } catch (error) {
    next(error); 
  }
};

export const getURL = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const paramId = req.params.shortId;

    if (!paramId || typeof paramId !== 'string') {
      return next(AppError.BadRequest('Invalid short ID parameter, bro.'));
    }

    const urlRecord = await UrlService.getAndProcessUrl(paramId);

    return res.status(200).json({
      message: 'Secret message retrieved!',
      content: urlRecord.message,
    });

  } catch (error) {
    next(error); 
  }
};