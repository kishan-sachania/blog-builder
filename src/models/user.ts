import { model, models, Schema } from 'mongoose';
import type { User as UserType } from '@/types';
import bcrypt from 'bcryptjs';

const userSchema = new Schema<UserType>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minLength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      minLength: [5, 'Email must be at least 5 characters long'],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'Staff Contributor',
      trim: true,
    },
    department: {
      type: String,
      default: 'Editorial',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Role is required'],
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

export const User = models.User || model<UserType>('User', userSchema);
