"use client";
import { useOptimistic, useRef } from "react";
import invariant from "tiny-invariant";

import { type loader } from "./page";
import { INTENTS, RenderedColumn, type RenderedItem } from "./types";
import { Column } from "./column";
import { NewColumn } from "./new-column";
import { EditableText } from "./components";
import { BoardActionProvider } from "./board-form-context";

export function Board({
  board,
  actionBoard,
}: {
  board: NonNullable<Awaited<ReturnType<typeof loader>>>;
  actionBoard: (formData: FormData) => void;
}) {
  let itemsById = new Map(board.items.map((item) => [item.id, item]));

  const [boardItems, addBoardItem] = useOptimistic(
    board.items,
    (state, optimisticState: any) => {
      return [...state, { ...optimisticState, pending: true }];
    }
  );
  const [boardColumns, addBoardColumn] = useOptimistic(
    board.columns,
    (state, optimisticState: any) => {
      return [...state, { ...optimisticState, pending: true }];
    }
  );

  async function action(formData: FormData) {
    let intent = formData.get("intent");

    if (intent === INTENTS.createItem || intent === INTENTS.moveItem) {
      const item = getPendingItem(formData);
      addBoardItem(item);
    }

    if (intent === INTENTS.createColumn) {
      const column = getPendingColumn(formData);
      addBoardColumn(column);
    }
    // TODO: optimistic state update
    actionBoard(formData);
  }
  // TODO: optimistic state update
  // let pendingItems = usePendingItems();

  // merge pending items and existing items
  // for (let pendingItem of pendingItems) {
  //   let item = itemsById.get(pendingItem.id);
  //   let merged = item
  //     ? { ...item, ...pendingItem }
  //     : { ...pendingItem, boardId: board.id };
  //   itemsById.set(pendingItem.id, merged);
  // }

  // merge pending and existing columns
  // TODO: optimistic state update
  // let optAddingColumns = usePendingColumns();
  type Column = (typeof board.columns)[number];
  // | (typeof optAddingColumns)[number];// TODO: optimistic state update
  type ColumnWithItems = Column & { items: typeof board.items };
  let columns = new Map<string, ColumnWithItems>();
  // TODO: optimistic state update
  for (let column of boardColumns) {
    columns.set(column.id, { ...column, items: [] });
  }

  // add items to their columns
  for (let item of boardItems) {
    let columnId = item.columnId;
    let column = columns.get(columnId);
    invariant(column, "missing column");
    column.items.push(item);
  }

  // scroll right when new columns are added
  let scrollContainerRef = useRef<HTMLDivElement>(null);
  function scrollRight() {
    invariant(scrollContainerRef.current, "no scroll container");
    scrollContainerRef.current.scrollLeft =
      scrollContainerRef.current.scrollWidth;
  }

  return (
    <BoardActionProvider action={action}>
      <div
        className="h-full min-h-0 flex flex-col overflow-x-scroll"
        ref={scrollContainerRef}
        style={{ backgroundColor: board.color }}
      >
        <h1>
          <EditableText
            value={board.name}
            fieldName="name"
            inputClassName="mx-8 my-4 text-2xl font-medium border border-slate-400 rounded-lg py-1 px-2 text-black"
            buttonClassName="mx-8 my-4 text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
            buttonLabel={`Edit board "${board.name}" name`}
            inputLabel="Edit board name"
          >
            <input
              type="hidden"
              name="intent"
              value={INTENTS.updateBoardName}
            />
            <input type="hidden" name="id" value={board.id} />
          </EditableText>
        </h1>

        <div className="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
          {[...columns.values()].map((col) => {
            return (
              <Column
                key={col.id}
                name={col.name}
                columnId={col.id}
                items={col.items}
                pending={(col as any).pending}
              />
            );
          })}

          <NewColumn
            boardId={board.id}
            onAdd={scrollRight}
            editInitially={board.columns.length === 0}
          />

          {/* trolling you to add some extra margin to the right of the container with a whole dang div */}
          <div data-lol className="w-8 h-1 flex-shrink-0" />
        </div>
      </div>
    </BoardActionProvider>
  );
}

// These are the inflight columns that are being created, instead of managing
// state ourselves, we just ask Remix for the state
// function usePendingColumns() {
//   type CreateColumnFetcher = ReturnType<typeof useFetchers>[number] & {
//     formData: FormData;
//   };

//   return useFetchers()
//     .filter((fetcher): fetcher is CreateColumnFetcher => {
//       return fetcher.formData?.get("intent") === INTENTS.createColumn;
//     })
//     .map((fetcher) => {
//       let name = String(fetcher.formData.get("name"));
//       let id = String(fetcher.formData.get("id"));
//       return { name, id };
//     });
// }

function getPendingColumn(formData: FormData) {
  let name = String(formData.get("name"));
  let id = String(formData.get("id"));
  return { name, id } as RenderedColumn;
}

function getPendingItem(formData: FormData) {
  let columnId = String(formData.get("columnId"));
  let title = String(formData.get("title"));
  let id = String(formData.get("id"));
  let order = Number(formData.get("order"));

  return {
    title,
    id,
    order,
    columnId,
    content: null,
  } as RenderedItem;
}

// // These are the inflight items that are being created or moved, instead of
// // managing state ourselves, we just ask Remix for the state
// function usePendingItems() {
//   type PendingItem = ReturnType<typeof useFetchers>[number] & {
//     formData: FormData;
//   };
//   return useFetchers()
//     .filter((fetcher): fetcher is PendingItem => {
//       if (!fetcher.formData) return false;
//       let intent = fetcher.formData.get("intent");
//       return intent === INTENTS.createItem || intent === INTENTS.moveItem;
//     })
//     .map((fetcher) => {
//       let columnId = String(fetcher.formData.get("columnId"));
//       let title = String(fetcher.formData.get("title"));
//       let id = String(fetcher.formData.get("id"));
//       let order = Number(fetcher.formData.get("order"));
//       let item: RenderedItem = { title, id, order, columnId, content: null };
//       return item;
//     });
// }
