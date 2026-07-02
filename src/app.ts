import express, { Application } from 'express';
import { connectDB } from './config';
import { connectRedis } from './config/redis.config.js';
import masterRouter from './routers';
import { errorHandler } from './middlewares/errorHandler.js';
import { config } from './utils/configVar.js';

export class App {
  public app: Application;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = config.port || 3000;
  }

  private initializeMiddlewares(): void {
    this.app.use(express.json());
  }

  private initializeRoutes(): void {
    this.app.use('/api/v1', masterRouter);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      console.log('Connecting to databases...');
      await connectDB();
      await connectRedis();

      this.initializeMiddlewares();
      this.initializeRoutes();
      this.initializeErrorHandling();

      this.app.listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Critical failure during app startup:', error);
      process.exit(1);
    }
  }
}
