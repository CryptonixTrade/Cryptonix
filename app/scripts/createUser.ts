import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const username = "user1";
  const password = "123456";

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: "USER",
    },
  });

  console.log("✅ User created");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });