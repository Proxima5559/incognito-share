import { Schema, model, Document } from 'mongoose';
import { IUrl } from '../interfaces';

const UrlSchema = new Schema<IUrl>({
  label: { 
    type: String, 
    trim: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  shortId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  maxViews: { 
    type: Number, 
    default: null 
  },
  viewCount: { 
    type: Number, 
    default: 0 
  },
  expiresAt: { 
    type: Date, 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

UrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const urlGenModel = model<IUrl>('UrlGen', UrlSchema);