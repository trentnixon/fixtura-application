export function paginationResultRange(args: {
  page: number;
  pageSize: number;
  total: number;
}): { start: number; end: number } | null {
  const { page, pageSize, total } = args;
  if (total <= 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return { start, end };
}
