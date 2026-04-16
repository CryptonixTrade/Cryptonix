"use client";

import { useEffect, useRef, useState, useMemo } from "react";

export default function Search({
  coins,
  setSymbol,
  symbol,
  favorites,
  setFavorites
}: any) {

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const ref = useRef<any>(null);

  // ===== LOAD FAVORITES
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // ===== SAVE FAVORITES
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // ===== CLOSE CLICK OUTSIDE
  useEffect(() => {
    const handleClick = (e: any) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ===== SEARCH OPTIMIZED
  const results = useMemo(() => {
    return coins
      .filter((c:any)=>c.symbol.endsWith("USDT"))
      .filter((c:any)=>
        c.symbol.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 50);
  }, [coins, search]);

  function toggleFavorite(sym:string){
    if(favorites.includes(sym)){
      setFavorites(favorites.filter((f:string)=>f!==sym));
    }else{
      setFavorites([...favorites, sym]);
    }
  }

  return (
    <div ref={ref} style={{ width: 260, position: "relative", marginBottom: 15 }}>

      {/* SELECTED */}
      <div style={{
        marginBottom:6,
        fontSize:11,
        color:"#888"
      }}>
        Selected: <span style={{color:"#ffd700"}}>{symbol}</span>
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
        style={{
          width:"100%",
          padding:"10px 10px",
          background:"#0f0f0f",
          color:"#fff",
          border:"1px solid #222",
          borderRadius:8,
          outline:"none",
          transition:"0.2s",
          boxShadow: open ? "0 0 0 1px #ffd700" : "none"
        }}
      />

      {/* DROPDOWN */}
      <div
        style={{
          position:"absolute",
          top:"100%",
          left:0,
          width:"100%",
          background:"#0a0a0a",
          border:"1px solid #222",
          borderRadius:8,
          marginTop:6,
          maxHeight: open ? 320 : 0,
          overflow:"hidden",
          overflowY:"auto",
          zIndex:100,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0px)" : "translateY(-5px)",
          transition:"all 0.2s ease"
        }}
      >

        {results.map((c:any)=>{

          const change = Number(c.priceChangePercent);
          const price = Number(c.lastPrice).toFixed(2);
          const isFav = favorites.includes(c.symbol);
          const isActive = symbol === c.symbol;

          return (
            <div
              key={c.symbol}
              onMouseDown={()=>{
                setSymbol(c.symbol);
                setOpen(false);
              }}
              style={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                padding:"8px 10px",
                fontSize:12,
                cursor:"pointer",
                background: isActive ? "#1a1a1a" : "transparent",
                transition:"0.15s"
              }}
              onMouseEnter={(e)=>{
                if(!isActive) e.currentTarget.style.background = "#151515";
              }}
              onMouseLeave={(e)=>{
                if(!isActive) e.currentTarget.style.background = "transparent";
              }}
            >

              {/* LEFT */}
              <div style={{display:"flex",flexDirection:"column"}}>
                <span style={{fontWeight:500}}>
                  {c.symbol.replace("USDT","")}
                </span>
                <span style={{fontSize:10,opacity:0.5}}>
                  {price}
                </span>
              </div>

              {/* RIGHT */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>

                <div style={{
                  color: change >= 0 ? "#00ff66" : "#ff3b3b",
                  fontSize:11,
                  minWidth:40,
                  textAlign:"right"
                }}>
                  {change.toFixed(1)}%
                </div>

                <div
                  onMouseDown={(e)=>{
                    e.stopPropagation();
                    toggleFavorite(c.symbol);
                  }}
                  style={{
                    color: isFav ? "#ffd700" : "#444",
                    cursor:"pointer",
                    transition:"0.2s",
                    transform: isFav ? "scale(1.2)" : "scale(1)"
                  }}
                >
                  ★
                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* FAVORITES */}
      {favorites.length > 0 && (
        <div style={{marginTop:12, fontSize:11}}>

          <div style={{marginBottom:4, color:"#888"}}>
            ⭐ Favorites
          </div>

          <div style={{
            display:"flex",
            gap:6,
            flexWrap:"wrap"
          }}>
            {favorites.map((f:string)=>{

              const isActive = symbol === f;

              return (
                <div
                  key={f}
                  onClick={()=>setSymbol(f)}
                  style={{
                    padding:"4px 8px",
                    borderRadius:6,
                    cursor:"pointer",
                    background: isActive ? "#ffd700" : "#111",
                    color: isActive ? "#000" : "#ccc",
                    fontSize:11,
                    transition:"0.2s",
                    transform:"scale(1)"
                  }}
                  onMouseEnter={(e)=>{
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e)=>{
                    e.currentTarget.style.transform = "scale(1)";
                  }}
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