import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

let prismaInstance;

try {
  if (process.env.DATABASE_URL) {
    prismaInstance = globalForPrisma.prisma || new PrismaClient();
    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prismaInstance;
    }
  }
} catch (e) {
  console.warn("Prisma client initialization deferred or DATABASE_URL not active:", e.message);
}

export const prisma = prismaInstance;
export default prisma;
