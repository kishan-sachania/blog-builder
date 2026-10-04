import { seedRBAC } from "./seed-rbac";

async function main() {
  await seedRBAC();
}

main().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
