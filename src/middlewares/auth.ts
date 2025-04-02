import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get API key from header or query parameter
    const apiKey = 
      req.header('X-API-Key') || 
      req.query.api_key as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required',
      });
    }

    // Find user by API key
    const user = await User.findOne({ apiKey, isActive: true });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive API key',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Middleware to check if the user has enough quota
export const checkEmailQuota = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    // Check if quota reset date has passed
    if (new Date() > user.resetQuotaDate) {
      user.emailsSentToday = 0;
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      user.resetQuotaDate = tomorrow;
      await user.save();
    }

    // Check if quota exceeded
    if (user.emailsSentToday >= user.dailyEmailQuota) {
      return res.status(429).json({
        success: false,
        message: 'Daily email quota exceeded',
        quota: {
          limit: user.dailyEmailQuota,
          used: user.emailsSentToday,
          resetsAt: user.resetQuotaDate,
        },
      });
    }

    next();
  } catch (error) {
    logger.error(`Quota check error: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to check quota',
    });
  }
}; 