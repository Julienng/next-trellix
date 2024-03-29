import { prisma } from "@/db";

import { ItemMutation } from "./types";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs";
import invariant from "tiny-invariant";
import { notFound } from "next/navigation";

export async function loader(id: string | undefined | null) {
  const user = await currentUser();
  if (!user) return undefined;

  invariant(id, "Missing board ID");

  const board = await getBoardData(Number(id), user.id);
  if (!board) throw notFound();

  return board;
}

export function deleteCard(id: string, accountId: string) {
  return prisma.item.delete({ where: { id, Board: { accountId } } });
}

export const getBoardData = cache(async function getBoardData(
  boardId: number,
  accountId: string
) {
  return prisma.board.findUnique({
    where: {
      id: boardId,
      accountId: accountId,
    },
    include: {
      items: true,
      columns: { orderBy: { order: "asc" } },
    },
  });
});

export async function updateBoardName(
  boardId: number,
  name: string,
  accountId: string
) {
  return prisma.board.update({
    where: { id: boardId, accountId: accountId },
    data: { name },
  });
}

export function upsertItem(
  mutation: ItemMutation & { boardId: number },
  accountId: string
) {
  return prisma.item.upsert({
    where: {
      id: mutation.id,
      Board: {
        accountId,
      },
    },
    create: mutation,
    update: mutation,
  });
}

export async function updateColumnName(
  id: string,
  name: string,
  accountId: string
) {
  return prisma.column.update({
    where: { id, Board: { accountId } },
    data: { name },
  });
}

export async function createColumn(
  boardId: number,
  name: string,
  id: string,
  accountId: string
) {
  let columnCount = await prisma.column.count({
    where: { boardId, Board: { accountId } },
  });
  return prisma.column.create({
    data: {
      id,
      boardId,
      name,
      order: columnCount + 1,
    },
  });
}
