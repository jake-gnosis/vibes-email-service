import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User';
import logger from '../utils/logger';
import crypto from 'crypto';

interface AuthRequest extends Request {
  user?: any;
}

// Helper function to hash passwords
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Generate API key and hash password
    const apiKey = uuidv4();
    const hashedPassword = hashPassword(password);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      apiKey,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        dailyEmailQuota: user.dailyEmailQuota,
      },
    });
  } catch (error) {
    logger.error(`Error in register controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to register user',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        dailyEmailQuota: user.dailyEmailQuota,
        emailsSentToday: user.emailsSentToday,
      },
    });
  } catch (error) {
    logger.error(`Error in login controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to login',
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
        dailyEmailQuota: user.dailyEmailQuota,
        emailsSentToday: user.emailsSentToday,
        resetQuotaDate: user.resetQuotaDate,
      },
    });
  } catch (error) {
    logger.error(`Error in getProfile controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get profile',
    });
  }
};

export const regenerateApiKey = async (req: AuthRequest, res: Response) => {
  try {
    const newApiKey = uuidv4();
    
    // Update user with new API key
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { apiKey: newApiKey },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'API key regenerated successfully',
      data: {
        apiKey: user.apiKey,
      },
    });
  } catch (error) {
    logger.error(`Error in regenerateApiKey controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to regenerate API key',
    });
  }
}; 