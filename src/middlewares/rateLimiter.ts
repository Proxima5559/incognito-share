import rateLimit from 'express-rate-limit';
import {redisClient } from '../config/redis.config.js';
import { RedisStore } from 'rate-limit-redis';

const safeSendCommand = async (...args: string[]): Promise<any> => {
  if (!redisClient.isReady) {
    await new Promise((resolve) => setTimeout(resolve, 30));
    return safeSendCommand(...args);
  }
  return redisClient.sendCommand(args);
};

const urlStore = new RedisStore({
  sendCommand: safeSendCommand, 
  prefix: 'rl:url:',
});

export const urlGetLimiter = rateLimit({
  store: urlStore,
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

const authStore = new RedisStore({
  sendCommand: safeSendCommand, 
  prefix: 'rl:auth:',
});

export const authLimiter = rateLimit({
  store: authStore,
  windowMs: 15 * 60 * 1000,
  max: 10,
});