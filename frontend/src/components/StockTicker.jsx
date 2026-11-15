// A fake stock-market ticker that scrolls across the top of the page.

const STOCKS = [
  { symbol: "SYNRG", change: "▲ 420.69%", up: true },
  { symbol: "LEVRG", change: "▲ 12.00%", up: true },
  { symbol: "BNDWDTH", change: "▼ 98.00% (at capacity)", up: false },
  { symbol: "CIRCLBK", change: "↻ 0.00%", up: true },
  { symbol: "ALIGN", change: "▲ 3.14%", up: true },
  { symbol: "PIVOT", change: "▼ 50% ▲ 50%", up: false },
  { symbol: "MTGS", change: "▲ 900% (could've been emails)", up: true },
  { symbol: "RAISES", change: "▼ 100%", up: false },
  { symbol: "PIZZA", change: "▲ 1 slice", up: true },
];

function TickerItems() {
  return STOCKS.map((stock) => (
    <span key={stock.symbol} className="mx-6 whitespace-nowrap">
      <span className="font-semibold text-gray-300">{stock.symbol}</span>{" "}
      <span className={stock.up ? "text-emerald-400" : "text-rose-400"}>{stock.change}</span>
    </span>
  ));
}

export default function StockTicker() {
  return (
    <div className="overflow-hidden border-b border-white/10 bg-black/40 py-1.5 font-mono text-xs" aria-hidden="true">
      {/* The list is written twice side by side. The animation slides it left
          by exactly half its width, then restarts: it looks endless. */}
      <div className="flex w-max animate-ticker">
        <TickerItems />
        <TickerItems />
      </div>
    </div>
  );
}
