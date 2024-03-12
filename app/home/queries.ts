import { prisma } from "@/db";

export async function deleteBoard(boardId: number, accountId: string) {
  return prisma.board.delete({
    where: { id: boardId, accountId },
  });
}

export async function createBoard(userId: string, name: string, color: string) {
  return prisma.board.create({
    data: {
      name,
      color,
      accountId: userId,
    },
  });
}

export async function getHomeData(userId: string) {
  return prisma.board.findMany({
    where: {
      accountId: userId,
    },
  });
}