"use client";
import { LoaderIcon } from "lucide-react";
import { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./button";

export function Form(props: ComponentProps<"form">) {
  return <form {...props} />;
}

export function IconSubmit({ children, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <button {...props} type="submit">
      {pending === true ? <LoaderIcon className="animate-spin" /> : children}
    </button>
  );
}

export function Submit({ children, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();
  return (
    <Button {...props} type="submit">
      {pending === true ? <LoaderIcon className="animate-spin" /> : children}
    </Button>
  );
}
