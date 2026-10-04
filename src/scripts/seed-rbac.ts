import mongoose from "mongoose";
import { Permission, Role } from "@/models";
import { permissionsToSeed } from "@/lib/rbac";

export async function seedRBAC() {
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
  }

  const allPermissionIds = permissionDocs.map((p) => p._id);

  console.log("Seeding admin role...");
  const adminRole = await Role.findOneAndUpdate(
    { name: { $regex: /^admin$/i } },
    {
      name: "admin",
      description: "Administrator with full permissions across all resources",
      permissions: allPermissionIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`Admin Role ready (Permissions: ${adminRole.permissions.length})`);

  // Employee/Author role has blog, category, tag, and self-profile permissions
  const employeePermissionIds = permissionDocs
    .filter(
      (p) =>
        p.resource === "blog" ||
        p.resource === "category" ||
        p.resource === "tag" ||
        (p.resource === "user" && (p.action === "read" || p.action === "update"))
    )
    .map((p) => p._id);

  const employeeRole = await Role.findOneAndUpdate(
    { name: { $regex: /^(employee|author|user)$/i } },
    {
      name: "employee",
      description: "Standard author with content authoring and publishing permissions",
      permissions: employeePermissionIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`Employee Role ready (Permissions: ${employeeRole.permissions.length})`);

  await mongoose.disconnect();
  console.log("RBAC seeding completed successfully!");
}

if (require.main === module) {
  seedRBAC().catch((err) => {
    console.error("RBAC Seeding error:", err);
    process.exit(1);
  });
}
