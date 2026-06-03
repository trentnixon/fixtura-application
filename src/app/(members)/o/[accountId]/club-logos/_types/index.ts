export type ClubLogosScreenProps = {
  accountId: string;
};

export type ClubLogosScreenView =
  | { kind: "redirecting" }
  | { kind: "loading" }
  | { kind: "error"; message: string; onRetry: () => void }
  | { kind: "idle" }
  | { kind: "ready" };
