export type UserVisibleError = {
  message: string;
  code?: string;
};

export function toUserVisibleError(unknownError: unknown): UserVisibleError {
  if (unknownError instanceof Error) {
    return { message: unknownError.message };
  }
  if (typeof unknownError === "string") {
    return { message: unknownError };
  }
  return { message: "Unexpected error" };
}
