import mongoose from "mongoose";
import { Permission, Role, User, Blog, Category, Tag } from "@/models";

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongoUri.trim());
  console.log("Connected successfully to database:", mongoose.connection.name);

  console.log("Initializing Schema collections & indexes...");
  await Promise.all([
    Permission.init(),
    Role.init(),
    User.init(),
    Blog.init(),
    Category.init(),
    Tag.init(),
  ]);
  console.log("All schemas and indexes initialized successfully.");

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Error initializing schemas:", err);
  process.exit(1);
});
