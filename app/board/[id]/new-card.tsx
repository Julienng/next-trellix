import { useRef } from "react";
import invariant from "tiny-invariant";

import { INTENTS, ItemMutationFields } from "./types";
import { SaveButton, CancelButton } from "./components";
import { boardDetailAction } from "./action";
import { useBoardAction } from "./board-form-context";

export function NewCard({
  columnId,
  nextOrder,
  onComplete,
  onAddCard,
}: {
  columnId: string;
  nextOrder: number;
  onComplete: () => void;
  onAddCard: () => void;
}) {
  let textAreaRef = useRef<HTMLTextAreaElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
  const onBoardAction = useBoardAction();

  return (
    <form
      method="post"
      className="px-2 py-1 border-t-2 border-b-2 border-transparent"
      action={async (formData) => {
        let id = crypto.randomUUID();
        formData.set(ItemMutationFields.id.name, id);
        await onBoardAction(formData);

        invariant(textAreaRef.current);
        textAreaRef.current.value = "";
        onAddCard();
      }}
      // onSubmit={(event) => {
      //   event.preventDefault();

      //   let formData = new FormData(event.currentTarget);
      //   let id = crypto.randomUUID();
      //   formData.set(ItemMutationFields.id.name, id);

      //   submit(formData, {
      //     method: "post",
      //     fetcherKey: `card:${id}`,
      //     navigate: false,
      //     unstable_flushSync: true,
      //   });

      //   invariant(textAreaRef.current);
      //   textAreaRef.current.value = "";
      //   onAddCard();
      // }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onComplete();
        }
      }}
    >
      <input type="hidden" name="intent" value={INTENTS.createItem} />

      <input
        type="hidden"
        name={ItemMutationFields.columnId.name}
        value={columnId}
      />
      <input
        type="hidden"
        name={ItemMutationFields.order.name}
        value={nextOrder}
      />

      <textarea
        autoFocus
        required
        ref={textAreaRef}
        name={ItemMutationFields.title.name}
        placeholder="Enter a title for this card"
        className="outline-none shadow text-sm rounded-lg w-full py-1 px-2 resize-none placeholder:text-sm placeholder:text-slate-500 h-14"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            invariant(buttonRef.current, "expected button ref");
            buttonRef.current.click();
          }
          if (event.key === "Escape") {
            onComplete();
          }
        }}
        onChange={(event) => {
          let el = event.currentTarget;
          el.style.height = el.scrollHeight + "px";
        }}
      />
      <div className="flex justify-between">
        <SaveButton ref={buttonRef}>Save Card</SaveButton>
        <CancelButton onClick={onComplete}>Cancel</CancelButton>
      </div>
    </form>
  );
}
