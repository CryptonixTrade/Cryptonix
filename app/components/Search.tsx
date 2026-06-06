"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

  const ref = useRef<any>(null);

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
    const handleClick = (e: any) => {
      if (
        ref.current &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  /* ======================================================
     RESULTS
  ====================================================== */

  const results = useMemo(() => {
    if (!coins?.length) return [];

    const filtered = coins
      .filter((c: any) =>
        c.symbol.endsWith("USDT")
      )
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

    return sorted.slice(0, 50);
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
    setOpen(false);
  }

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div
      ref={ref}
      className="relative w-[180px]"
    >

      {/* ======================================================
          LABEL
      ====================================================== */}

      <div className="mb-2 flex items-center justify-between">

        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--cx-text-muted)]">
          Market Search
        </div>

        <div className="cx-chip px-2 py-[4px]">
          LIVE
        </div>

      </div>

      {/* ======================================================
          ACTIVE SYMBOL
      ====================================================== */}

      <div className="cx-card-sm mb-3 flex items-center justify-between border border-[var(--cx-line-soft)] bg-white/[0.025] px-2 py-1">

        <div>

          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--cx-text-muted)]">
            Selected Pair
          </div>

          <div className="mt-1 text-lg font-bold text-[var(--cx-gold-soft)]">
            {symbol}
          </div>

        </div>

        <div className="relative flex items-center justify-center">

          <div className="h-3 w-3 rounded-full bg-orange-400 shadow-[0_0_16px_rgba(255,170,0,0.9)]" />

          <div className="absolute h-3 w-3 animate-ping rounded-full bg-orange-400/40" />

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
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          className="
            cx-input
            w-full
            py-2 pl-8 pr-2
            text-[10px] text-white
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
        className="
        fixed left-[20px] top-[140px] z-[999999]
        max-h-[220px] w-[320px] overflow-y-auto
        cx-panel
        p-2
        "
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
	                onMouseDown={() => selectSymbol(c.symbol)}
	                onClick={() => selectSymbol(c.symbol)}
	                onTouchEnd={(e) => {
	                  e.preventDefault();
	                  selectSymbol(c.symbol);
	                }}
	                className={`
                  group relative mb-1 cursor-pointer overflow-hidden rounded-xl border p-1 transition-all duration-300
                  ${
                    isActive
                      ? "border-orange-400/20 bg-orange-400/10"
                      : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
                  }
                `}
              >

                {/* GLOW */}
                <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-[90px] w-[90px] rounded-full bg-orange-500/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0" />

                <div className="relative z-10 flex items-center justify-between">

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
                  <div className="flex items-center gap-3">

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

                    {/* STAR */}
                    <button
                      onMouseDown={(e) => {
                        e.stopPropagation();

                        toggleFavorite(
                          c.symbol
                        );
                      }}
                      className={`
                        text-lg transition-all duration-300
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

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ======================================================
          FAVORITES
      ====================================================== */}

      {favorites.length > 0 && (
        <div className="mt-5">

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
                        : "border-white/8 bg-white/[0.03] text-white/70 hover:border-white/15 hover:bg-white/[0.05]"
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
