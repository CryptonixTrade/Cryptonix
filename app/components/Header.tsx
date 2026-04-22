"use client";

export default function Header({
  symbol,
  price,
  btcSpot,
  btcFutures,
}: any) {

  const change = 0.85;
  const isUp = change >= 0;

  return (
    <div className="relative mb-2 rounded-xl border border-yellow-500/10 bg-gradient-to-br from-[#0f0f0f]/90 to-[#0a0a0a]/95 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.06),inset_0_0_20px_rgba(255,215,0,0.03)] overflow-hidden">

      {/* 🔥 TOP GLOW LINE */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 md:p-4">

        {/* LEFT (SYMBOL) */}
        <div className="flex items-center gap-2">

          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_12px_rgba(255,215,0,0.8)]" />

          <div>
            <div className="text-white text-base md:text-lg font-bold tracking-wide">
              {symbol}
            </div>

            <div className="text-[10px] md:text-xs tracking-widest text-yellow-400/80">
              CRYPTONIX
            </div>
          </div>
        </div>

        {/* CENTER (PRICE) */}
        <div className="text-center md:text-center">

          <div className="text-lg md:text-xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            {price ? price.toFixed(2) : "--"}
          </div>

          <div
            className={`text-xs ${
              isUp ? "text-green-400" : "text-red-400"
            }`}
          >
            {isUp ? "+" : ""}
            {change}%
          </div>
        </div>

        {/* RIGHT (SPOT/FUTURES) */}
        <div className="flex flex-col md:items-end text-xs gap-1">

          <div className="text-green-400">
            Spot: {btcSpot ? btcSpot.toFixed(2) : "--"}
          </div>

          <div className="text-orange-400">
            Futures: {btcFutures ? btcFutures.toFixed(2) : "--"}
          </div>

        </div>

      </div>
    </div>
  );
}