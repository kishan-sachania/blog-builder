import mongoose from "mongoose";
import { Permission } from "../../models/permission";
import { Role } from "../../models/role";

const defaultPermissions = [
    // Posts permissions
    { name: "posts:create", resource: "posts", action: "create" },
    { name: "posts:read", resource: "posts", action: "read" },
    { name: "posts:update", resource: "posts", action: "update" },
    { name: "posts:delete", resource: "posts", action: "delete" },

    // Users permissions
    { name: "users:create", resource: "users", action: "create" },
    { name: "users:read", resource: "users", action: "read" },
    { name: "users:update", resource: "users", action: "update" },
    { name: "users:delete", resource: "users", action: "delete" },

    // Categories permissions
    { name: "categories:create", resource: "categories", action: "create" },
    { name: "categories:read", resource: "categories", action: "read" },
    { name: "categories:update", resource: "categories", action: "update" },
    { name: "categories:delete", resource: "categories", action: "delete" },
];

async function seed() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("MONGO_URI is not set in environment variables");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri.trim());
    console.log("Connected to database:", mongoose.connection.name);

    console.log("Seeding permissions...");
    const permissionDocs = [];
    for (const perm of defaultPermissions) {
        const doc = await Permission.findOneAndUpdate(
            { name: perm.name },
            perm,
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        permissionDocs.push(doc);
    }
    console.log(`Seeded ${permissionDocs.length} permissions.`);

    // All permissions for Admin
    const allPermissionIds = permissionDocs.map((p) => p._id);

    // Employee permissions (read all, create & update posts)
    const employeePermissionIds = permissionDocs
        .filter((p) =>
            p.name.includes(":read") ||
            p.name === "posts:create" ||
            p.name === "posts:update"
        )
        .map((p) => p._id);

    console.log("Seeding roles...");
    const adminRole = await Role.findOneAndUpdate(
        { name: "Admin" },
        {
            name: "Admin",
            description: "System Administrator with full access",
            permissions: allPermissionIds,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    const employeeRole = await Role.findOneAndUpdate(
        { name: "Employee" },
        {
            name: "Employee",
            description: "Employee with standard read and post creation permissions",
            permissions: employeePermissionIds,
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log("\n--- Seeding Summary ---");
    console.log(`Admin Role ID: ${adminRole._id}`);
    console.log(`  Permissions count: ${adminRole.permissions.length}`);
    console.log(`Employee Role ID: ${employeeRole._id}`);
    console.log(`  Permissions count: ${employeeRole.permissions.length}`);

    await mongoose.disconnect();
    console.log("Seeding completed successfully!");
}

seed().catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
});
