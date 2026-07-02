import { nanoid } from 'nanoid';
import { urlGenModel } from '../models';
import { AppError } from '../utils/appError.js';

export class UrlService {
  
  private static async generateUniqueShortId(): Promise<string> {
    const MAX_ATTEMPTS = 5;
    let attempts = 0;

    do {
      const shortId = nanoid(6);
      const existing = await urlGenModel.findOne({ shortId });
      if (!existing) return shortId;
      attempts++;
    } while (attempts < MAX_ATTEMPTS);

    throw AppError.Internal('Server busy. Could not generate unique hash.');
  }

  static async createShortUrl(label: string, message: string, maxViews?: any) {
    const shortId = await this.generateUniqueShortId();
    
    const EXPIRE_MINUTES = 5;
    const expiresAt = new Date(Date.now() + EXPIRE_MINUTES * 60 * 1000);
    const finalMaxViews = maxViews ? Number(maxViews) : null;

    return await urlGenModel.create({
      label,
      message,
      shortId,
      maxViews: finalMaxViews,
      expiresAt,
    });
  }

  static async getAndProcessUrl(shortId: string) {
    const urlRecord = await urlGenModel.findOne({ shortId });

    if (!urlRecord) {
      throw AppError.NotFound('Link not found or already deleted.');
    }

    if (urlRecord.expiresAt && new Date() > new Date(urlRecord.expiresAt)) {
      await urlGenModel.deleteOne({ shortId }); 
      throw AppError.Gone('This link has expired.');
    }

    if (urlRecord.maxViews !== undefined && urlRecord.maxViews !== null) {
      if (urlRecord.maxViews <= 0) {
        await urlGenModel.deleteOne({ shortId }); 
        throw AppError.Gone('This link has already been viewed.');
      }

      if (urlRecord.maxViews === 1) {
        await urlGenModel.deleteOne({ shortId });
      } else {
        urlRecord.maxViews -= 1;
        await urlRecord.save(); 
      }
    }

    return urlRecord; 
  }
}
