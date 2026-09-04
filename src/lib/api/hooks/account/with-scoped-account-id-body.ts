export function withScopedAccountIdBody<T extends object>(
  accountId: string,
  body: T,
): T & { accountId: number } {
  const numericAccountId = Number.parseInt(accountId, 10);
  if (!Number.isInteger(numericAccountId) || numericAccountId <= 0) {
    throw new Error("Invalid account id");
  }
  return { ...body, accountId: numericAccountId };
}
