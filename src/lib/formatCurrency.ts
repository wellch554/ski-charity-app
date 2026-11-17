// Display-only helper. Per CLAUDE.md, money is rounded only when shown,
// never inside calculations.
const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCurrency(dollars: number): string {
  return usd.format(dollars);
}
