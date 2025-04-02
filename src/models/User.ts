import mongoose, { Schema, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  apiKey: string;
  dailyEmailQuota: number;
  emailsSentToday: number;
  resetQuotaDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String,
      default: () => uuidv4(),
      unique: true,
    },
    dailyEmailQuota: {
      type: Number,
      default: 100,
    },
    emailsSentToday: {
      type: Number,
      default: 0,
    },
    resetQuotaDate: {
      type: Date,
      default: () => {
        const tomorrow = new Date();
        tomorrow.setHours(0, 0, 0, 0);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema); 