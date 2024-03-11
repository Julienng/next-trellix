"use client";
import { MouseEvent } from "react";

export function stopEventPropagation(e: MouseEvent<HTMLButtonElement>) {
  e.stopPropagation();
}
