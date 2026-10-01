import mongoose from "mongoose";
import { Permission } from "../../models/permission";
import { Role } from "../../models/role";
import { User } from "../../models/user";

async function main() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        console.error("MONGO_URI not set");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri.trim());
    console.log("Connected successfully to database:", mongoose.connection.name);

    console.log("Initializing Permission collection & indexes...");
    await Permission.createCollection();
    await Permission.init();
    console.log("Permission initialized.");

    console.log("Initializing Role collection & indexes...");
    await Role.createCollection();
    await Role.init();
    console.log("Role initialized.");

    console.log("Initializing User collection & indexes...");
    await User.createCollection();
    await User.init();
    console.log("User initialized.");

    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log("Existing collections in database:", collections?.map(c => c.name));

    const permissionIndexes = await Permission.collection.indexes();
    console.log("Permission indexes:", permissionIndexes);

    const roleIndexes = await Role.collection.indexes();
    console.log("Role indexes:", roleIndexes);

    const userIndexes = await User.collection.indexes();
    console.log("User indexes:", userIndexes);

    await mongoose.disconnect();
    console.log("Done!");
}

main().catch(err => {
    console.error("Error initializing schemas:", err);
    process.exit(1);
});
