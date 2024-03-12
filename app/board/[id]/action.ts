"use server";

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";
import { INTENTS } from "./types";
import {
  createColumn,
  deleteCard,
  updateBoardName,
  updateColumnName,
  upsertItem,
} from "./queries";
import { parseItemMutation } from "./utils";
import { revalidatePath } from "next/cache";

export async function boardDetailAction(boardId: number, formData: FormData) {
  let { userId } = auth();
  if (!userId) redirect("/login");

  const accountId = userId;

  invariant(boardId && !Number.isNaN(boardId), "Missing boardId");

  let intent = formData.get("intent");

  if (!intent) throw new Error("Missing intent");

  switch (intent) {
    case INTENTS.deleteCard: {
      let id = String(formData.get("itemId") || "");
      await deleteCard(id, accountId);
      break;
    }
    case INTENTS.updateBoardName: {
      let name = String(formData.get("name") || "");
      invariant(name, "Missing name");
      await updateBoardName(boardId, name, accountId);
      break;
    }
    case INTENTS.moveItem:
    case INTENTS.createItem: {
      let mutation = parseItemMutation(formData);
      await upsertItem({ ...mutation, boardId }, accountId);
      break;
    }
    case INTENTS.createColumn: {
      let { name, id } = Object.fromEntries(formData);
      invariant(name, "Missing name");
      invariant(id, "Missing id");
      await createColumn(boardId, String(name), String(id), accountId);
      break;
    }
    case INTENTS.updateColumn: {
      let { name, columnId } = Object.fromEntries(formData);
      if (!name || !columnId) throw new Error("Missing name or columnId");
      await updateColumnName(String(columnId), String(name), accountId);
      break;
    }
    default: {
      throw new Error(`Unknown intent: ${intent}`);
    }
  }
  revalidatePath(`/board/${boardId}`);

  return { ok: true };
}
