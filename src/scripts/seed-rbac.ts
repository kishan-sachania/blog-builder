import mongoose from "mongoose";
import { Permission } from "../../models/permission";
import { Role } from "../../models/role";

const permissionsToSeed = [
  // Blog resource permissions
  { name: "blog:create", resource: "blog", action: "create" },
  { name: "blog:read", resource: "blog", action: "read" },
  { name: "blog:update", resource: "blog", action: "update" },
  { name: "blog:delete", resource: "blog", action: "delete" },

  // User resource permissions
  { name: "user:create", resource: "user", action: "create" },
  { name: "user:read", resource: "user", action: "read" },
  { name: "user:update", resource: "user", action: "update" },
  { name: "user:delete", resource: "user", action: "delete" },

  // Category resource permissions
  { name: "category:create", resource: "category", action: "create" },
  { name: "category:read", resource: "category", action: "read" },
  { name: "category:update", resource: "category", action: "update" },
  { name: "category:delete", resource: "category", action: "delete" },

  // Tag resource permissions
  { name: "tag:create", resource: "tag", action: "create" },
  { name: "tag:read", resource: "tag", action: "read" },
  { name: "tag:update", resource: "tag", action: "update" },
  { name: "tag:delete", resource: "tag", action: "delete" },
];

async function seedRBAC() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is not set in environment variables");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri.trim());
  console.log("Connected to database:", mongoose.connection.name);

  console.log("Seeding RBAC permissions...");
  const permissionDocs = [];
  for (const perm of permissionsToSeed) {
    const doc = await Permission.findOneAndUpdate(
      { resource: perm.resource, action: perm.action },
      perm,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    permissionDocs.push(doc);
    console.log(`Permission upserted: ${perm.resource}:${perm.action} (${doc._id})`);
  }

  const allPermissionIds = permissionDocs.map((p) => p._id);

  console.log("Seeding admin role...");
  const adminRole = await Role.findOneAndUpdate(
    { name: { $regex: /^admin$/i } },
    {
      name: "admin",
      description: "Administrator with full permissions",
      permissions: allPermissionIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`Admin Role ID: ${adminRole._id}, permissions: ${adminRole.permissions.length}`);

  // Author / Employee / User role has full blog, category, tag, and user read/update permissions
  const authorPermissionIds = permissionDocs
    .filter((p) => p.resource === "blog" || p.resource === "category" || p.resource === "tag" || (p.resource === "user" && (p.action === "read" || p.action === "update")))
    .map((p) => p._id);

  const employeeRole = await Role.findOneAndUpdate(
    { name: { $regex: /^(employee|author|user)$/i } },
    {
      name: "employee",
      description: "Standard author with full blog creation, drafting, and publishing permissions",
      permissions: authorPermissionIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`Employee Role ID: ${employeeRole._id}, permissions: ${employeeRole.permissions.length}`);

  await mongoose.disconnect();
  console.log("RBAC seeding completed successfully!");
}

seedRBAC().catch((err) => {
  console.error("RBAC Seeding error:", err);
  process.exit(1);
});
