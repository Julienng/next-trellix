import { PrismaClient } from "@prisma/client";

let prismaDBInit: PrismaClient | undefined = undefined;

if (process.env.NODE_ENV === "development") {
  const prismaClient = (global as any).__prisma_client as
    | PrismaClient
    | undefined;

  if (prismaClient) prismaDBInit = prismaClient;
}

if (!prismaDBInit) {
  prismaDBInit = new PrismaClient();

  process.on("beforeExit", () => {
    if (prismaDBInit) prismaDBInit.$disconnect();
  });
}

export const prisma = prismaDBInit as PrismaClient;
