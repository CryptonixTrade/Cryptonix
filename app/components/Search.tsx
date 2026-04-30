"use client";

import { useEffect, useRef, useState, useMemo } from "react";

export default function Search(props: any) {

  const {
    symbol = "BTCUSDT",
    setSymbol = () => {},
    coins = []
  } = props;
  
  const [favorites, setFavorites] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const ref = useRef<any>(null);

  /* ===== LOAD FAVORITES ===== */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("favorites");
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
  }, []);

  /* ===== SAVE FAVORITES ===== */
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  /* ===== CLICK OUTSIDE ===== */
  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ===== RESULTS ===== */
  const results = useMemo(() => {
    if (!coins?.length) return [];

    const filtered = coins
      .filter((c:any)=>c.symbol.endsWith("USDT"))
      .filter((c:any)=>
        c.symbol.toLowerCase().includes(search.toLowerCase())
      );

    const sorted = filtered.sort((a:any, b:any)=>{
      const aFav = favorites.includes(a.symbol) ? 1 : 0;
      const bFav = favorites.includes(b.symbol) ? 1 : 0;
      return bFav - aFav;
    });

    return sorted.slice(0, 50);

  }, [coins, search, favorites]);

  function toggleFavorite(sym:string){
    setFavorites((prev:string[])=>{
      if(prev.includes(sym)){
        return prev.filter(f=>f!==sym);
      } else {
        return [...prev, sym];
      }
    });
  }

  return (
    <div ref={ref} className="w-full md:w-[260px] relative">

      {/* SELECTED */}
      <div className="mb-1 text-xs text-gray-500">
        Selected: <span className="text-yellow-400">{symbol}</span>
      </div>

      {/* INPUT */}
      <input
        placeholder="Search coin..."
        value={search}
        onFocus={()=>setOpen(true)}
        onChange={(e)=>{
          setSearch(e.target.value);
          setOpen(true);
        }}
        className={`
          w-full px-3 py-2 text-sm rounded-lg outline-none
          bg-[#0f0f0f] text-white border border-[#222]
          focus:border-yellow-400 transition
        `}
      />

      {/* DROPDOWN */}
      {open && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-[#222] rounded-lg max-h-[300px] overflow-y-auto z-50">

          {results.map((c:any)=>{

            const change = Number(c.priceChangePercent || 0);
            const price = Number(c.lastPrice || 0).toFixed(2);
            const isFav = favorites.includes(c.symbol);
            const isActive = symbol === c.symbol;

            return (
              <div
                key={c.symbol}
                onMouseDown={()=>{
                  setSymbol(c.symbol);
                  setOpen(false);
                }}
                className={`
                  flex justify-between items-center px-3 py-2 text-sm cursor-pointer
                  ${isActive ? "bg-[#1a1a1a]" : "hover:bg-[#151515]"}
                `}
              >

                {/* LEFT */}
                <div className="flex flex-col">
                  <span className="font-medium">
                    {c.symbol.replace("USDT","")}
                  </span>
                  <span className="text-[10px] opacity-50">
                    {price}
                  </span>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">

                  <div className={`text-xs min-w-[45px] text-right ${
                    change >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {change.toFixed(1)}%
                  </div>

                  <div
                    onMouseDown={(e)=>{
                      e.stopPropagation();
                      toggleFavorite(c.symbol);
                    }}
                    className={`cursor-pointer transition ${
                      isFav ? "text-yellow-400 scale-110" : "text-gray-600"
                    }`}
                  >
                    ★
                  </div>

                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* FAVORITES */}
      {favorites.length > 0 && (
        <div className="mt-3 text-xs">

          <div className="mb-1 text-gray-500">
            ⭐ Favorites
          </div>

          <div className="flex flex-wrap gap-2">
            {favorites.map((f:string)=>{

              const isActive = symbol === f;

              return (
                <div
                  key={f}
                  onClick={()=>setSymbol(f)}
                  className={`
                    px-2 py-1 rounded-md cursor-pointer text-xs transition
                    ${isActive
                      ? "bg-yellow-400 text-black"
                      : "bg-[#111] text-gray-300 hover:bg-[#1a1a1a]"
                    }
                  `}
                >
                  {f.replace("USDT","")}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}