import { currentUser } from "@clerk/nextjs";
import { Metadata } from "next";

import { getBoardData } from "./queries";
import { notFound, redirect } from "next/navigation";
import invariant from "tiny-invariant";

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

async function loader(id: string | undefined | null) {
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

  return <div></div>;
}