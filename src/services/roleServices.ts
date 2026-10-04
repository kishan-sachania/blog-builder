import mongoose from "mongoose";
import { Role, Permission } from "../../models";

const defaultPermissionsToSeed = [
  // Blog permissions
  { name: "blog:create", resource: "blog", action: "create" },
  { name: "blog:read", resource: "blog", action: "read" },
  { name: "blog:update", resource: "blog", action: "update" },
  { name: "blog:delete", resource: "blog", action: "delete" },

  // User permissions
  { name: "user:create", resource: "user", action: "create" },
  { name: "user:read", resource: "user", action: "read" },
  { name: "user:update", resource: "user", action: "update" },
  { name: "user:delete", resource: "user", action: "delete" },

  // Category permissions
  { name: "category:create", resource: "category", action: "create" },
  { name: "category:read", resource: "category", action: "read" },
  { name: "category:update", resource: "category", action: "update" },
  { name: "category:delete", resource: "category", action: "delete" },

  // Tag permissions
  { name: "tag:create", resource: "tag", action: "create" },
  { name: "tag:read", resource: "tag", action: "read" },
  { name: "tag:update", resource: "tag", action: "update" },
  { name: "tag:delete", resource: "tag", action: "delete" },
];

async function ensureDefaultPermissions() {
  const permDocs = [];
  for (const perm of defaultPermissionsToSeed) {
    const doc = await Permission.findOneAndUpdate(
      { resource: perm.resource, action: perm.action },
      perm,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    permDocs.push(doc);
  }
  return permDocs;
}

const getRole = async (role: string) => {
  if (!role || typeof role !== "string") {
    return null;
  }

  const trimmedRole = role.trim();

  // 1. If it's a valid ObjectId, search by ID first
  if (mongoose.isValidObjectId(trimmedRole)) {
    const roleById = await Role.findById(trimmedRole);
    if (roleById) return roleById;
  }

  // 2. Case-insensitive exact name search
  let responseRole = await Role.findOne({
    name: { $regex: new RegExp(`^${trimmedRole}$`, "i") },
  });
  if (responseRole) return responseRole;

  // 3. Fallback to common aliases
  const isAdmin = /^(admin|administrator|superadmin)$/i.test(trimmedRole);
  const isEmployee = /^(employee|author|user|staff|contributor|member)$/i.test(trimmedRole);

  if (isAdmin) {
    responseRole = await Role.findOne({
      name: { $regex: /^(admin|administrator|superadmin)$/i },
    });
    if (responseRole) return responseRole;
  } else if (isEmployee) {
    responseRole = await Role.findOne({
      name: { $regex: /^(employee|author|user|staff|contributor|member)$/i },
    });
    if (responseRole) return responseRole;
  }

  // 4. Auto-bootstrap role and permissions if missing in DB
  try {
    const permDocs = await ensureDefaultPermissions();
    const allPermIds = permDocs.map((p) => p._id);

    if (isAdmin) {
      responseRole = await Role.findOneAndUpdate(
        { name: { $regex: /^admin$/i } },
        {
          name: trimmedRole.toLowerCase() === "admin" ? "admin" : trimmedRole,
          description: "Administrator with full access",
          permissions: allPermIds,
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
      return responseRole;
    }

    // Default: Employee / Author role (includes blog, category, tag, and own user read/update permissions)
    const authorPermIds = permDocs
      .filter((p) => p.resource === "blog" || p.resource === "category" || p.resource === "tag" || (p.resource === "user" && (p.action === "read" || p.action === "update")))
      .map((p) => p._id);

    responseRole = await Role.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${trimmedRole}$`, "i") } },
      {
        name: trimmedRole,
        description: "Standard author with content creation and editing permissions",
        permissions: authorPermIds,
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    return responseRole;
  } catch (error) {
    console.error("Failed to auto-seed role:", error);
    // Final fallback: return any existing role if available
    return await Role.findOne();
  }
};

export { getRole };