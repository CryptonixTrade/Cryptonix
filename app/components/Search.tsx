"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const QUOTE_ASSETS = [
  "USDT",
  "FDUSD",
  "USDC",
  "BUSD",
  "TUSD",
  "BTC",
  "ETH",
  "BNB",
  "TRY",
  "EUR",
  "BRL",
];

function getBaseAsset(symbol: string) {
  const upper = String(symbol || "").toUpperCase();
  const quote = QUOTE_ASSETS.find(
    (asset) => upper.endsWith(asset) && upper.length > asset.length
  );

  return quote ? upper.slice(0, -quote.length) : upper;
}

function getCoinLogoUrls(baseAsset: string) {
  const lower = baseAsset.toLowerCase();

  return [
    `https://assets.coincap.io/assets/icons/${lower}@2x.png`,
    `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/${lower}.png`,
  ];
}

export default function Search(props: any) {
  const {
    symbol = "BTCUSDT",
    setSymbol = () => {},
    coins = [],
  } = props;

  const [favorites, setFavorites] =
    useState<string[]>([]);

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const baseAsset = useMemo(
    () => getBaseAsset(symbol),
    [symbol]
  );

  const coinLogoUrls = useMemo(
    () => getCoinLogoUrls(baseAsset),
    [baseAsset]
  );

  const [coinLogoIndex, setCoinLogoIndex] =
    useState(0);

  const ref = useRef<any>(null);
  const favoritePointerHandledRef =
    useRef(false);

  useEffect(() => {
    setCoinLogoIndex(0);
  }, [baseAsset]);

  /* ======================================================
     LOAD FAVORITES
  ====================================================== */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("favorites");

      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {}
  }, []);

  /* ======================================================
     SAVE FAVORITES
  ====================================================== */

	  useEffect(() => {
	    try {
	      localStorage.setItem(
	        "favorites",
	        JSON.stringify(favorites)
	      );
	    } catch {}
	  }, [favorites]);

  /* ======================================================
     CLICK OUTSIDE
  ====================================================== */

  useEffect(() => {
    const handlePointer = (e: any) => {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointer);

    return () =>
      document.removeEventListener("pointerdown", handlePointer);
  }, []);

  /* ======================================================
     RESULTS
  ====================================================== */

  const results = useMemo(() => {
    if (!coins?.length) return [];

    const filtered = coins
      .filter((c: any) =>
        c.symbol
          .toLowerCase()
          .includes(search.toLowerCase())
      );

    const sorted = filtered.sort(
      (a: any, b: any) => {
        const aFav = favorites.includes(
          a.symbol
        )
          ? 1
          : 0;

        const bFav = favorites.includes(
          b.symbol
        )
          ? 1
          : 0;

        return bFav - aFav;
      }
    );

    return sorted.slice(0, search.trim() ? 120 : 80);
  }, [coins, search, favorites]);

  /* ======================================================
     FAVORITES
  ====================================================== */

  function toggleFavorite(sym: string) {
    setFavorites((prev: string[]) => {
      if (prev.includes(sym)) {
        return prev.filter(
          (f) => f !== sym
        );
      }

      return [...prev, sym];
    });
  }

  function selectSymbol(sym: string) {
    setSymbol(sym);
    setSearch("");
    setOpen(false);
  }

  function handleMarketSelect(e: any, sym: string) {
    e.stopPropagation();
    selectSymbol(sym);
  }

  function handleFavoritePointer(e: any, sym: string) {
    e.preventDefault();
    e.stopPropagation();
    favoritePointerHandledRef.current = true;
    toggleFavorite(sym);
  }

  function handleFavoriteClick(e: any, sym: string) {
    e.preventDefault();
    e.stopPropagation();

    if (favoritePointerHandledRef.current) {
      favoritePointerHandledRef.current = false;
      return;
    }

    toggleFavorite(sym);
  }

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div
      ref={ref}
      className="cryptonixSearch cxControlSurface relative w-[180px]"
    >

      {/* ======================================================
          LABEL
      ====================================================== */}

      <div className="cxSelectedMarket mb-3 flex items-center justify-between">

        <div>

          <div className="cxMicroLabel">
            Market
          </div>

          <div className="mt-2 flex items-center gap-2">

            <span className="cxCoinLogoShell">
              {coinLogoIndex < coinLogoUrls.length ? (
                <Image
                  src={coinLogoUrls[coinLogoIndex]}
                  alt={`${baseAsset} logo`}
                  width={22}
                  height={22}
                  className="cxCoinLogo"
                  onError={() =>
                    setCoinLogoIndex((index) => index + 1)
                  }
                />
              ) : (
                <span className="cxCoinLogoFallback">
                  {baseAsset.slice(0, 2)}
                </span>
              )}
            </span>

            <span className="text-2xl font-semibold text-white">
              {symbol}
            </span>

          </div>

        </div>

        <div className="cxLivePill cxMarketLivePill px-3 py-2">

          <span />
          Live

        </div>

      </div>

      {/* ======================================================
          SEARCH INPUT
      ====================================================== */}

      <div className="relative">

        {/* ICON */}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
          ⌕
        </div>

        <input
          placeholder="Search market..."
          value={search}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className="
            cx-input
            w-full
            py-3 pl-10 pr-3
            text-sm text-white
            outline-none
            transition-all duration-300
            placeholder:text-white/25
          "
        />

      </div>

      {/* ======================================================
          DROPDOWN
      ====================================================== */}

      {open && (
        <div
          className="cryptonixSearchDropdown cryptonixMobileSearchOverlay cx-panel"
        >

          {/* EMPTY */}
          {results.length === 0 && (
            <div className="flex items-center justify-center py-10 text-sm text-white/35">
              No markets found
            </div>
          )}

          {/* RESULTS */}
          {results.map((c: any) => {
            const change = Number(
              c.priceChangePercent || 0
            );

            const price = Number(
              c.lastPrice || 0
            ).toFixed(2);

            const isFav =
              favorites.includes(c.symbol);

            const isActive =
              symbol === c.symbol;

            return (
	              <div
	                key={c.symbol}
	                className={`
                  group relative mb-1 cursor-pointer overflow-hidden rounded-xl border p-1 transition-all duration-300
                  ${
                    isActive
                      ? "border-white/20 bg-white/[0.08]"
                      : "border-white/5 bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.06]"
                  }
                `}
              >

                <button
                  type="button"
                  onPointerDown={(e) => handleMarketSelect(e, c.symbol)}
                  onMouseDown={(e) => handleMarketSelect(e, c.symbol)}
                  onTouchEnd={(e) => handleMarketSelect(e, c.symbol)}
                  onClick={(e) => handleMarketSelect(e, c.symbol)}
                  className="cryptonixMarketResultButton relative z-10 flex w-full items-center justify-between text-left"
                >

                  {/* LEFT */}
                  <div className="flex flex-col">

                    <div className="flex items-center gap-2">

                      <span className="text-[10px] font-bold text-white">
                        {c.symbol.replace(
                          "USDT",
                          ""
                        )}
                      </span>

                      {isFav && (
                        <span className="text-yellow-400">
                          ★
                        </span>
                      )}

                    </div>

                    <span className="mt-1 text-[11px] tracking-[0.12em] text-white/35">
                      ${price}
                    </span>

                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3 pr-8">

                    {/* CHANGE */}
                    <div
                      className={`text-[10px] font-semibold ${
                        change >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {change >= 0 ? "+" : ""}
                      {change.toFixed(1)}%
                    </div>

                  </div>

                </button>

                {/* STAR */}
                <button
                  type="button"
                  onPointerDown={(e) => handleFavoritePointer(e, c.symbol)}
                  onClick={(e) => handleFavoriteClick(e, c.symbol)}
                  className={`
                    absolute right-3 top-1/2 z-20 -translate-y-1/2 text-lg transition-all duration-300
                    ${
                      isFav
                        ? "scale-110 text-yellow-400"
                        : "text-white/20 hover:text-yellow-400"
                    }
                  `}
                >
                  ★
                </button>

              </div>
            );
          })}

        </div>
      )}

      {/* ======================================================
          FAVORITES
      ====================================================== */}

      {favorites.length > 0 && (
        <div className="cryptonixFavorites mt-4">

          {/* TITLE */}
          <div className="mb-3 flex items-center gap-2">

            <div className="text-yellow-400">
              ★
            </div>

            <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">
              Favorite Markets
            </div>

          </div>

          {/* LIST */}
          <div className="flex flex-wrap gap-2">

            {favorites.map((f: string) => {
              const isActive =
                symbol === f;

              return (
                <button
                  key={f}
                  onClick={() =>
                    setSymbol(f)
                  }
                  className={`
                    rounded-full border px-2 py-1 text-[9px] font-semibold tracking-[0.14em] transition-all duration-300
                    ${
                      isActive
                        ? "border-orange-400 bg-orange-400 text-black shadow-[0_0_18px_rgba(255,170,0,0.25)]"
                        : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-white/[0.15] hover:bg-white/[0.05]"
                    }
                  `}
                >
                  {f.replace("USDT", "")}
                </button>
              );
            })}

          </div>

        </div>
      )}

    </div>
  );
}
