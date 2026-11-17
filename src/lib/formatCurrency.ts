// Display-only helper. Per CLAUDE.md, money is rounded only when shown,
// never inside calculations.
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  // The default ("auto") keeps the minus sign on values that round to zero,
  // so a tiny negative float would show as "-$0". "negative" drops it.
  signDisplay: "negative",
});

export function formatCurrency(dollars: number): string {
  return usd.format(dollars);
}
