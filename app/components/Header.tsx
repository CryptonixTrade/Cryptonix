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
        padding: "10px 0",
        marginBottom: 10,
        borderBottom: "1px solid #111",
      }}
    >

      {/* LEFT */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          {symbol}
        </div>

        <div style={{ fontSize: 12, opacity: 0.6 }}>
          Perpetual
        </div>
      </div>

      {/* CENTER (ПОЛНОСТЬЮ ПУСТО) */}
      <div />

      {/* RIGHT */}
      <div style={{ textAlign: "right", fontSize: 12 }}>

        <div style={{ color: "#00ff66" }}>
          Spot: {btcSpot?.toFixed(2)}
        </div>

        <div style={{ color: "#ff9900" }}>
          Futures: {btcFutures?.toFixed(2)}
        </div>

      </div>

    </div>
  );
}