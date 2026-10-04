import mongoose from 'mongoose';
import { Role } from '@/models';
import { connectDB } from '@/lib/db';

export async function getRole(role: string) {
  if (!role || typeof role !== 'string') {
    return null;
  }

  await connectDB();
  const trimmed = role.trim();

  // 1. If valid ObjectId, lookup by ID
  if (mongoose.isValidObjectId(trimmed)) {
    const roleById = await Role.findById(trimmed).populate('permissions');
    if (roleById) return roleById;
  }

  // 2. Case-insensitive exact name match
  return Role.findOne({
    name: { $regex: new RegExp(`^${trimmed}$`, 'i') },
  }).populate('permissions');
}

export const roleService = {
  getRole,
};
