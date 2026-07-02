export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static BadRequest(msg: string) { return new AppError(msg, 400); }
  static NotFound(msg: string = 'Resource not found') { return new AppError(msg, 404); }
  static Gone(msg: string = 'This link has expired or already been viewed') { return new AppError(msg, 410); }
  static Internal(msg: string = 'Internal server error') { return new AppError(msg, 500); }
  static Unauthorized(msg = 'Unauthorized') {return new AppError(msg, 401);}
  static Forbidden(msg = 'Forbidden') {return new AppError(msg, 403);}
}