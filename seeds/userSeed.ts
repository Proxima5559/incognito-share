import mongoose from 'mongoose';
import { UserModel } from '../src/models'; 
import { config } from '../src/utils/configVar.js';

const seedUsers = [
  {
    username: 'testuser1',
    email: 'user1@example.com',
    password: 'password123', 
  },
  {
    username: 'testuser2',
    email: 'user2@example.com',
    password: 'password123',
    isVerified: true,
  }
];

const runSeed = async () => {
  try {
    console.log('⏳ Connecting to MongoDB for seeding...');
    await mongoose.connect(config.mongoUrl); 
    console.log('Connected to database.');

    await UserModel.deleteMany({ email: { $in: ['user1@example.com', 'user2@example.com'] } });
    console.log(' Cleaned up any old matching test users.');

    await UserModel.create(seedUsers);
    console.log('Database successfully seeded with 2 test users!');

  } catch (error) {
    console.error('Error while seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
};

runSeed();