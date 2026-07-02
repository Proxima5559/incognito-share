import { createClient } from 'redis';
import { config } from '../utils/configVar.js';
const redisUrl = config.redisUrl;

if (!redisUrl) {
  console.error('Define the URL of Redis');
  process.exit(1);
}

export const redisClient = createClient({
  url: redisUrl,
  RESP: 2,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis connected successfully'));

export const connectRedis = async () => {
  await redisClient.connect();
};