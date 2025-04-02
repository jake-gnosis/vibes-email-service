import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ITemplate extends Document {
  user: IUser['_id'];
  name: string;
  description?: string;
  subject: string;
  text?: string;
  html?: string;
  variables: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    text: String,
    html: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-specific unique template names
TemplateSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model<ITemplate>('Template', TemplateSchema); 