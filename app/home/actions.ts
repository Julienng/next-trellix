"use server";
import { auth } from "@clerk/nextjs";
import { INTENTS } from "../board/[id]/types";
import { createBoard, deleteBoard } from "./queries";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function boardAction(formData: FormData) {
  "use server";
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let intent = String(formData.get("intent"));
  switch (intent) {
    case INTENTS.createBoard: {
      let name = String(formData.get("name") || "");
      let color = String(formData.get("color") || "");
      if (!name) throw new Error("Bad request");

      let board = await createBoard(userId, name, color);
      return redirect(`/board/${board.id}`);
    }
    case INTENTS.deleteBoard: {
      let boardId = formData.get("boardId");
      if (!boardId) throw new Error("Missing boardId");
      await deleteBoard(Number(boardId), userId);
      revalidatePath("/home");
      return { ok: true };
    }
    default: {
      throw new Error(`Unknown intent: ${intent}`);
    }
  }
}
