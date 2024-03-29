import { currentUser } from "@clerk/nextjs";
import { getHomeData } from "./queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { INTENTS } from "../board/[id]/types";
import { TrashIcon } from "lucide-react";
import { boardAction } from "./actions";
import { IconSubmit, Submit } from "@/components/Form";
import { Label, LabeledInput } from "@/components/input";
import { stopEventPropagation } from "@/utils/client-event";

export default function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>;
}) {
  return (
    <div className="h-full">
      <NewBoard intent={searchParams.intent as any} />
      <Boards />
    </div>
  );
}

async function Boards() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const boards = await getHomeData(user.id);

  return (
    <div className="p-8">
      <h2 className="font-bold mb-2 text-xl">Boards</h2>
      <nav className="flex flex-wrap gap-8">
        {boards.map((board) => (
          <Board
            key={board.id}
            name={board.name}
            id={board.id}
            color={board.color}
          />
        ))}
      </nav>
    </div>
  );
}

function Board({
  name,
  id,
  color,
}: {
  name: string;
  id: number;
  color: string;
}) {
  return (
    <Link
      href={`/board/${id}`}
      className="w-60 h-40 p-4 block border-b-8 shadow rounded hover:shadow-lg bg-white relative"
      style={{ borderColor: color }}
    >
      <div className="font-bold">{name}</div>
      <form action={boardAction}>
        <input type="hidden" name="intent" value={INTENTS.deleteBoard} />
        <input type="hidden" name="boardId" value={id} />
        <IconSubmit
          aria-label="Delete board"
          className="absolute top-4 right-4 hover:text-brand-red"
          type="submit"
          onClick={stopEventPropagation}
        >
          <TrashIcon />
        </IconSubmit>
      </form>
    </Link>
  );
}

function NewBoard({
  intent,
}: {
  intent: (typeof INTENTS)[keyof typeof INTENTS];
}) {
  let isCreating = intent === "createBoard";

  return (
    <form action={boardAction} className="p-8 max-w-md">
      <input type="hidden" name="intent" value="createBoard" />
      <div>
        <h2 className="font-bold mb-2 text-xl">New Board</h2>
        <LabeledInput label="Name" name="name" type="text" required />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Label htmlFor="board-color">Color</Label>
          <input
            id="board-color"
            name="color"
            type="color"
            defaultValue="#cbd5e1"
            className="bg-transparent"
          />
        </div>
        <Submit type="submit">{isCreating ? "Creating..." : "Create"}</Submit>
      </div>
    </form>
  );
}
