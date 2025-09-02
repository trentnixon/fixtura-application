"use client";

import { toast } from "sonner";

import { toUserVisibleError } from "./error";

export function toastError(error: unknown, title: string = "Error") {
  const parsed = toUserVisibleError(error);
  toast.error(title, {
    description: parsed.message,
  });
}

export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function toastInfo(message: string, description?: string) {
  toast(message, { description });
}
