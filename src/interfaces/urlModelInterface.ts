export interface IUrl extends Document {
  label?: string;          
  message: string;         
  shortId: string;         
  maxViews?: number | null;       
  viewCount: number;       
  expiresAt?: Date | null;       
  createdAt: Date;
}
