import { currentUser } from "@clerk/nextjs";
import { Metadata } from "next";

import { getBoardData } from "./queries";
import { notFound, redirect } from "next/navigation";
import invariant from "tiny-invariant";
import { Board } from "./board";
import { BoardActionProvider } from "./board-form-context";
import { boardDetailAction } from "./action";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata | undefined> {
  const board = await loader(params.id);
  return {
    title: `${board ? board.name : "Board"}`,
  };
}

export async function loader(id: string | undefined | null) {
  const user = await currentUser();
  if (!user) return undefined;

  invariant(id, "Missing board ID");

  const board = await getBoardData(Number(id), user.id);
  if (!board) throw notFound();

  return board;
}

export default async function BoardPage({
  params,
}: {
  params: { id: string };
}) {
  const board = await loader(params.id);

  if (!board) notFound();

  const action = boardDetailAction.bind(null, board.id);
  return <Board board={board} actionBoard={action} />;
}
