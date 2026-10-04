import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Permission } from "../../models/permission";
import { Role } from "../../models/role";
import { User } from "../../models/user";

const permissionsToSeed = [
  { name: "blog:create", resource: "blog", action: "create" },
  { name: "blog:read", resource: "blog", action: "read" },
  { name: "blog:update", resource: "blog", action: "update" },
  { name: "blog:delete", resource: "blog", action: "delete" },
  { name: "user:create", resource: "user", action: "create" },
  { name: "user:read", resource: "user", action: "read" },
  { name: "user:update", resource: "user", action: "update" },
  { name: "user:delete", resource: "user", action: "delete" },
];

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI is missing in environment variables!");
    process.exit(1);
  }

  console.log("-----------------------------------------");
  console.log("1. Checking Database Connection...");
  console.log("-----------------------------------------");

  const start = Date.now();
  await mongoose.connect(mongoUri.trim());
  const elapsed = Date.now() - start;

  console.log(`✓ Connected to MongoDB successfully in ${elapsed}ms`);
  console.log(`✓ Database Name: ${mongoose.connection.name}`);
  console.log(`✓ Ready State: ${mongoose.connection.readyState === 1 ? "Connected" : "Not Ready"}`);

  console.log("\n-----------------------------------------");
  console.log("2. Ensuring RBAC Permissions & Admin Role...");
  console.log("-----------------------------------------");

  const permissionDocs = [];
  for (const perm of permissionsToSeed) {
    const doc = await Permission.findOneAndUpdate(
      { resource: perm.resource, action: perm.action },
      perm,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    permissionDocs.push(doc);
  }
  console.log(`✓ ${permissionDocs.length} permissions verified.`);

  const allPermissionIds = permissionDocs.map((p) => p._id);

  const adminRole = await Role.findOneAndUpdate(
    { name: { $regex: /^admin$/i } },
    {
      name: "admin",
      description: "Administrator with full system permissions",
      permissions: allPermissionIds,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`✓ Admin Role ready (ID: ${adminRole._id}, Permissions: ${adminRole.permissions.length})`);

  console.log("\n-----------------------------------------");
  console.log("3. Creating/Updating Dummy Admin User...");
  console.log("-----------------------------------------");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const adminUser = await User.findOneAndUpdate(
    { email: "admin@example.com" },
    {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: adminRole._id,
      tokenVersion: 0,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  console.log(`✓ Admin User created/updated successfully!`);
  console.log(`  - Name: ${adminUser.name}`);
  console.log(`  - Email: ${adminUser.email}`);
  console.log(`  - Role: admin (${adminUser.role})`);
  console.log(`  - Token Version: ${adminUser.tokenVersion ?? 0}`);

  console.log("\n=========================================");
  console.log("  TEST CREDENTIALS READY                 ");
  console.log("=========================================");
  console.log("  Email:    admin@example.com            ");
  console.log("  Password: password123                  ");
  console.log("=========================================\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("DB/Admin Setup Error:", err);
  process.exit(1);
});
