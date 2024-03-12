"use client";
import { createContext, useContext } from "react";

type ActionFn<T = unknown> = (formData: FormData) => Promise<T> | T | void;

const BoardFormContext = createContext<ActionFn>(() => {});

export function BoardActionProvider<T>({
  children,
  action,
}: {
  children: React.ReactNode;
  action: ActionFn<T>;
}) {
  return (
    <BoardFormContext.Provider value={action}>
      {children}
    </BoardFormContext.Provider>
  );
}

export function useBoardAction() {
  return useContext(BoardFormContext);
}
