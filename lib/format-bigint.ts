// Helpers for "BigInt as string" amounts coming from BE

export function bigToNumber(s: string | bigint | number | undefined | null): number {
  if (s === undefined || s === null) return 0;
  if (typeof s === "number") return s;
  if (typeof s === "bigint") return Number(s);
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function formatVND(s: string | number | bigint | undefined | null): string {
  const n = bigToNumber(s);
  return n.toLocaleString("vi-VN") + " đ";
}

export function formatVNDShort(s: string | number | bigint | undefined | null): string {
  const n = bigToNumber(s);
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + " tr";
  return n.toLocaleString("vi-VN");
}
