import { User } from "../../models/user";
import { getRole } from "./roleServices";

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string; // 'name' | 'createdAt'
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

const getUsers = async (options: GetUsersOptions = {}) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 10);
  const skip = (page - 1) * limit;

  const query: any = {};

  if (options.search && options.search.trim()) {
    query.$or = [
      { name: { $regex: options.search.trim(), $options: "i" } },
      { email: { $regex: options.search.trim(), $options: "i" } },
    ];
  }

  if (options.startDate || options.endDate) {
    query.createdAt = {};
    if (options.startDate) {
      query.createdAt.$gte = new Date(options.startDate);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const sortField = options.sortBy === "name" ? "name" : "createdAt";
  const sortDirection = options.sortOrder === "asc" ? 1 : -1;
  const sortOption: any = { [sortField]: sortDirection };

  const [users, total] = await Promise.all([
    User.find(query)
      .populate("role", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items: users.map((u: any) => ({
      ...u,
      id: u._id.toString(),
      roleName: typeof u.role === "object" && u.role?.name ? u.role.name : "Author",
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getUserById = async (id: string) => {
  const user = await User.findById(id).populate("role", "name").lean();
  if (!user) return null;
  return {
    ...user,
    id: (user as any)._id.toString(),
    roleName: typeof (user as any).role === "object" && (user as any).role?.name ? (user as any).role.name : "Author",
  };
};

const deleteUser = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const createUser = async (payload: any) => {
  const { name, email, password } = payload;
  const role = await getRole(payload.role);
  if (!role) {
    throw new Error(`Role '${payload.role}' not found`);
  }

  const isUserExists = await User.findOne({ email });
  if (isUserExists) {
    throw new Error("User already exists");
  }
  const user = await User.create({ name, email, role: role._id, password });
  return user;
};

const updateUser = async (id: string, updates: any) => {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name.trim();
  if (updates.avatar || updates.avatarUrl) updateData.avatar = updates.avatar || updates.avatarUrl;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.role) {
    const roleDoc = await getRole(updates.role);
    if (!roleDoc) {
      throw new Error(`Role '${updates.role}' not found`);
    }
    updateData.role = roleDoc._id;
  }
  const user = await User.findByIdAndUpdate(id, updateData, { new: true })
    .populate("role", "name")
    .lean();
  if (!user) {
    throw new Error("User not found");
  }
  return {
    ...user,
    id: (user as any)._id.toString(),
    roleName:
      typeof (user as any).role === "object" && (user as any).role?.name
        ? (user as any).role.name
        : "Author",
  };
};

const getUserByEmail = async (email: string) => {
  if (!email) return null;
  return await User.findOne({ email: email.toLowerCase() })
    .select("+password")
    .populate("role", "name");
};

export { getUsers, getUserById, deleteUser, createUser, updateUser, getUserByEmail };
