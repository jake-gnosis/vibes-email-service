import mongoose from 'mongoose';
import config from './index';
import logger from '../utils/logger';

const connectToDatabase = async (): Promise<void> => {
  try {
    const options = {
      autoIndex: config.env !== 'production', // Don't build indexes in production
    };

    await mongoose.connect(config.mongoUri, options);
    logger.info('Connected to MongoDB successfully');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB disconnected, trying to reconnect...');
});

// If Node process ends, close MongoDB connection
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default connectToDatabase; 