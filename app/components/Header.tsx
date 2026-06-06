"use client";

export default function Header(props: any) {
  const {
    symbol = "BTCUSDT",
    price = 0,
    btcSpot = 0,
    btcFutures = 0,
    changePercent = 0,
  } = props;

  const change = Number(changePercent || 0);
  const isUp = change >= 0;

  return (
    <div className="cryptonixHeader cx-panel cxReveal relative mb-6 overflow-hidden">
      <div className="cxAuroraField" aria-hidden="true" />

      <div className="relative z-10 grid gap-6 px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="flex min-w-0 items-start gap-5">
          <div className="cxBrandMark" aria-hidden="true">
            <span className="cxBrandNode cxBrandNodeTl" />
            <span className="cxBrandNode cxBrandNodeTr" />
            <span className="cxBrandNode cxBrandNodeBl" />
            <span className="cxBrandNode cxBrandNodeBr" />
            <span className="cxBrandBar cxBrandBarA" />
            <span className="cxBrandBar cxBrandBarB" />
            <span className="cxBrandCircuit cxBrandCircuitLeft" />
            <span className="cxBrandCircuit cxBrandCircuitRight" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="cxMicroLabel">CRYPTONIX LIFE</span>
              <span className="cxLivePill">
                <span />
                Live Intelligence
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-[0.98] text-white md:text-6xl lg:text-7xl">
              AI Market
              <span className="block text-[var(--cx-gold-soft)]">Operating System</span>
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/52">
              <span className="text-white/[0.86]">{symbol}</span>
              <span className="h-1 w-1 rounded-full bg-white/28" />
              <span>Neural trading dashboard</span>
            </div>
          </div>
        </div>

        <div className="cxHeroMarket">
          <div>
            <div className="cxMicroLabel">Real-time market pulse</div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="cxHeroPrice">
                $
                {price
                  ? price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "--"}
              </div>

              <div
                className={`cxChangePill ${
                  isUp ? "cxChangePillUp" : "cxChangePillDown"
                }`}
              >
                {isUp ? "+" : ""}
                {change.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="cryptonixHeaderMetric cxMetricTile">
              <div className="cxMetricLabel">Spot</div>
              <div className="cxMetricValue text-green-300">
                {btcSpot
                  ? btcSpot.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "--"}
              </div>
            </div>

            <div className="cryptonixHeaderMetric cxMetricTile">
              <div className="cxMetricLabel">Futures</div>
              <div className="cxMetricValue text-[var(--cx-gold-soft)]">
                {btcFutures
                  ? btcFutures.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "--"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
