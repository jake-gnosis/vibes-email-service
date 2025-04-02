import express from 'express';
import cors from 'cors';
import config from './config';
import connectToDatabase from './config/database';
import logger from './utils/logger';
import emailRoutes from './routes/emailRoutes';
import templateRoutes from './routes/templateRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import emailService from './services/EmailService';

// Create Express app
const app = express();

// Apply middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/users', userRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Initialize email service
    await emailService.initialize();
    
    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err}`);
  process.exit(1);
});

// Start the server
startServer(); 