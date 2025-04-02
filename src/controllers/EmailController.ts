import { Request, Response } from 'express';
import emailService from '../services/EmailService';
import templateService from '../services/TemplateService';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}

export const sendEmail = async (req: AuthRequest, res: Response) => {
  try {
    const {
      from,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
      tags,
      metadata,
    } = req.body;

    // Basic validation
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one recipient is required',
      });
    }

    if (!subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        message: 'Either text or HTML content is required',
      });
    }

    // Send the email
    const email = await emailService.sendEmail({
      user: req.user,
      from,
      to,
      cc,
      bcc,
      subject,
      text,
      html,
      attachments,
      tags,
      metadata,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      data: {
        id: email._id,
        messageId: email.messageId,
        status: email.status,
      },
    });
  } catch (error) {
    logger.error(`Error in sendEmail controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email',
    });
  }
};

export const sendTemplatedEmail = async (req: AuthRequest, res: Response) => {
  try {
    const {
      from,
      to,
      cc,
      bcc,
      templateId,
      templateData,
      attachments,
      tags,
      metadata,
    } = req.body;

    // Basic validation
    if (!to || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one recipient is required',
      });
    }

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    // Render the template
    const rendered = await templateService.renderTemplate({
      templateId,
      data: templateData || {},
    });

    // Send the email
    const email = await emailService.sendEmail({
      user: req.user,
      from,
      to,
      cc,
      bcc,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      attachments,
      tags,
      metadata,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Templated email sent successfully',
      data: {
        id: email._id,
        messageId: email.messageId,
        status: email.status,
      },
    });
  } catch (error) {
    logger.error(`Error in sendTemplatedEmail controller: ${error}`);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send templated email',
    });
  }
};

export const getEmailStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const email = await emailService.getEmailStatus(id);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    // Check if the email belongs to the authenticated user
    if (email.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: email._id,
        to: email.to,
        subject: email.subject,
        status: email.status,
        statusMessage: email.statusMessage,
        messageId: email.messageId,
        createdAt: email.createdAt,
      },
    });
  } catch (error) {
    logger.error(`Error in getEmailStatus controller: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get email status',
    });
  }
};

export const getEmailHistory = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = parseInt(req.query.skip as string, 10) || 0;

    const emails = await emailService.getUserEmailHistory(req.user._id, limit, skip);

    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails.map(email => ({
        id: email._id,
        to: email.to,
        subject: email.subject,
        status: email.status,
        messageId: email.messageId,
        createdAt: email.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`Error in getEmailHistory controller: ${error}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get email history',
    });
  }
}; 