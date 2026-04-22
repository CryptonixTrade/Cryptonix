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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px",
        marginBottom: 10,

        /* 🔥 PREMIUM GLASS */
        background: "linear-gradient(145deg, rgba(15,15,15,0.85), rgba(10,10,10,0.95))",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,215,0,0.08)",
        borderRadius: 12,

        /* 🔥 GLOW */
        boxShadow: `
          0 0 30px rgba(255,215,0,0.06),
          inset 0 0 20px rgba(255,215,0,0.03)
        `,

        position: "relative",
        overflow: "hidden"
      }}
    >

      {/* 🔥 ENERGY LIGHT */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: "linear-gradient(to right, transparent, #ffd700, transparent)",
        opacity: 0.6
      }}/>

      {/* 🔥 BRAND LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* LOGO DOT */}
        <div style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ffd700",
          boxShadow: "0 0 12px rgba(255,215,0,0.8)"
        }}/>

        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: 0.6,
            color: "#fff"
          }}>
            {symbol}
          </div>

          <div style={{
            fontSize: 10,
            letterSpacing: 1.5,
            color: "#ffd700",
            opacity: 0.8
          }}>
            CRYPTONIX
          </div>
        </div>
      </div>

      {/* CENTER */}
      <div style={{
        textAlign: "center",
        fontSize: 12
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#ffd700",
          textShadow: "0 0 12px rgba(255,215,0,0.5)"
        }}>
          {price ? price.toFixed(2) : "--"}
        </div>

        <div style={{
          fontSize: 11,
          color: isUp ? "#00ff66" : "#ff3b3b",
          textShadow: isUp
            ? "0 0 6px rgba(0,255,100,0.4)"
            : "0 0 6px rgba(255,50,50,0.4)"
        }}>
          {isUp ? "+" : ""}{change}%
        </div>
      </div>

      {/* RIGHT */}
      <div style={{
        textAlign: "right",
        fontSize: 11,
        display: "flex",
        flexDirection: "column",
        gap: 3
      }}>

        <div style={{
          color: "#00ff66",
          textShadow: "0 0 8px rgba(0,255,100,0.4)"
        }}>
          Spot: {btcSpot?.toFixed(2) || "--"}
        </div>

        <div style={{
          color: "#ff9900",
          textShadow: "0 0 8px rgba(255,150,0,0.4)"
        }}>
          Futures: {btcFutures?.toFixed(2) || "--"}
        </div>

      </div>

    </div>
  );
}