import invariant from "tiny-invariant";
import { useState, useTransition } from "react";

import { INTENTS, CONTENT_TYPES } from "./types";

import { Loader, Trash } from "lucide-react";
import { useBoardAction } from "./board-form-context";

interface CardProps {
  title: string;
  content: string | null;
  id: string;
  columnId: string;
  order: number;
  nextOrder: number;
  previousOrder: number;
  pending?: boolean;
}

export function Card({
  title,
  content,
  id,
  columnId,
  order,
  nextOrder,
  previousOrder,
  pending,
}: CardProps) {
  const onBoardAction = useBoardAction();
  const [isPending, startTransition] = useTransition();

  let [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");

  return isPending ? null : (
    <li
      onDragOver={(event) => {
        if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
          event.preventDefault();
          event.stopPropagation();
          let rect = event.currentTarget.getBoundingClientRect();
          let midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(event.clientY <= midpoint ? "top" : "bottom");
        }
      }}
      onDragLeave={() => {
        setAcceptDrop("none");
      }}
      onDrop={(event) => {
        event.stopPropagation();

        let transfer = JSON.parse(
          event.dataTransfer.getData(CONTENT_TYPES.card)
        );
        invariant(transfer.id, "missing cardId");
        invariant(transfer.title, "missing title");

        let droppedOrder = acceptDrop === "top" ? previousOrder : nextOrder;
        let moveOrder = (droppedOrder + order) / 2;

        // let mutation: ItemMutation = {
        //   order: moveOrder,
        //   columnId: columnId,
        //   id: transfer.id,
        //   title: transfer.title,
        // };
        const data = new FormData();

        data.set("order", moveOrder.toString());
        data.set("columnId", columnId);
        data.set("id", transfer.id);
        data.set("title", transfer.title);
        data.set("intent", INTENTS.moveItem);

        onBoardAction(data);
        // submit(
        //   { ...mutation, intent: INTENTS.moveItem },
        //   {
        //     method: "post",
        //     navigate: false,
        //     fetcherKey: `card:${transfer.id}`,
        //   }
        // );

        setAcceptDrop("none");
      }}
      className={
        "border-t-2 border-b-2 -mb-[2px] last:mb-0 cursor-grab active:cursor-grabbing px-2 py-1 " +
        (acceptDrop === "top"
          ? "border-t-brand-red border-b-transparent"
          : acceptDrop === "bottom"
          ? "border-b-brand-red border-t-transparent"
          : "border-t-transparent border-b-transparent")
      }
    >
      <div
        draggable
        className="bg-white shadow shadow-slate-300 border-slate-300 text-sm rounded-lg w-full py-1 px-2 relative"
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(
            CONTENT_TYPES.card,
            JSON.stringify({ id, title })
          );
        }}
      >
        <h3 className="flex gap-2">
          <span>{title}</span>{" "}
          {pending ? <Loader className="animate-spin" /> : null}
        </h3>
        <div className="mt-2">{content || <>&nbsp;</>}</div>
        <form
          action={(formData) => {
            startTransition(() => {
              onBoardAction(formData);
            });
          }}
        >
          <input type="hidden" name="intent" value={INTENTS.deleteCard} />
          <input type="hidden" name="itemId" value={id} />
          <button
            aria-label="Delete card"
            className="absolute top-4 right-4 hover:text-brand-red"
            type="submit"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Trash />
          </button>
        </form>
      </div>
    </li>
  );
}
