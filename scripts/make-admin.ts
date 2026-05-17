import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const users = await db.user.findMany({ select: { username: true, email: true, isAdmin: true } });
  console.log("All users:", users);

  const email = process.argv[2];
  if (email) {
    const updated = await db.user.update({
      where: { email },
      data: { isAdmin: true },
      select: { username: true, email: true, isAdmin: true },
    });
    console.log("Granted admin to:", updated);
  } else {
    console.log("\nUsage: npx tsx scripts/make-admin.ts your@email.com");
  }
}

main().finally(() => db.$disconnect());
