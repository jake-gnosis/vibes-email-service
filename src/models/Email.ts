import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IEmail extends Document {
  user: IUser['_id'];
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
  }[];
  status: 'pending' | 'sent' | 'failed';
  statusMessage?: string;
  messageId?: string;
  ipAddress?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: [String],
      required: true,
      validate: [(v: string[]) => v.length > 0, 'At least one recipient is required'],
    },
    cc: {
      type: [String],
      default: [],
    },
    bcc: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
      required: true,
    },
    text: String,
    html: String,
    attachments: [
      {
        filename: String,
        contentType: String,
        size: Number,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    statusMessage: String,
    messageId: String,
    ipAddress: String,
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
EmailSchema.index({ user: 1, createdAt: -1 });
EmailSchema.index({ status: 1 });
EmailSchema.index({ tags: 1 });

export default mongoose.model<IEmail>('Email', EmailSchema); 