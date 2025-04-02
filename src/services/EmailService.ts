import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';
import Email from '../models/Email';
import User from '../models/User';
import { IUser } from '../models/User';
import { IEmail } from '../models/Email';

interface SendEmailParams {
  user: IUser;
  from?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
  tags?: string[];
  metadata?: Record<string, any>;
  ipAddress?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: {
        user: config.email.smtp.auth.user,
        pass: config.email.smtp.auth.pass,
      },
    });
  }

  // Initialize the email service
  public async initialize(): Promise<void> {
    try {
      // Verify SMTP connection configuration
      await this.transporter.verify();
      logger.info('SMTP connection established successfully');
    } catch (error) {
      logger.error(`SMTP connection failed: ${error}`);
      throw error;
    }
  }

  // Send an email
  public async sendEmail(params: SendEmailParams): Promise<IEmail> {
    try {
      // Check if user has enough quota
      if (params.user.emailsSentToday >= params.user.dailyEmailQuota) {
        throw new Error('Daily email quota exceeded');
      }

      // Check if quota needs to be reset
      if (new Date() > params.user.resetQuotaDate) {
        await User.findByIdAndUpdate(params.user._id, {
          emailsSentToday: 0,
          resetQuotaDate: (() => {
            const tomorrow = new Date();
            tomorrow.setHours(0, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
          })(),
        });
      }

      // Create email record in database
      const email = new Email({
        user: params.user._id,
        from: params.from || config.email.from,
        to: params.to,
        cc: params.cc || [],
        bcc: params.bcc || [],
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments?.map(attachment => ({
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size,
        })),
        status: 'pending',
        tags: params.tags || [],
        metadata: params.metadata,
        ipAddress: params.ipAddress,
      });

      await email.save();

      // Prepare email options
      const mailOptions: SendMailOptions = {
        from: params.from || config.email.from,
        to: params.to.join(','),
        cc: params.cc?.join(','),
        bcc: params.bcc?.join(','),
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments,
      };

      // Send email through nodemailer
      const info = await this.transporter.sendMail(mailOptions);

      // Update email record with success info
      email.status = 'sent';
      email.messageId = info.messageId;
      await email.save();

      // Increment user's email sent count
      await User.findByIdAndUpdate(params.user._id, {
        $inc: { emailsSentToday: 1 },
      });

      logger.info(`Email sent successfully: ${info.messageId}`);
      return email;
    } catch (error) {
      logger.error(`Error sending email: ${error}`);

      // If email record was created, update it with failure info
      if (params.user?._id) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await Email.findOneAndUpdate(
          { user: params.user._id, to: params.to, subject: params.subject, status: 'pending' },
          { status: 'failed', statusMessage: errorMessage }
        );
      }

      throw error;
    }
  }

  // Get email status
  public async getEmailStatus(emailId: string): Promise<IEmail | null> {
    return Email.findById(emailId);
  }

  // Get user email history
  public async getUserEmailHistory(userId: string, limit = 10, skip = 0): Promise<IEmail[]> {
    return Email.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }
}

export default new EmailService(); 