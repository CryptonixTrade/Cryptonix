"use client";

export default function TradeButtons({ selected, setSelected }: any) {

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

      <button
        onClick={() => setSelected("LONG")}
        style={{
          background: "#00cc66",
          padding: "8px 12px",
          borderRadius: 6,
          border: selected === "LONG" ? "2px solid #fff" : "none",
          cursor: "pointer"
        }}
      >
        LONG
      </button>

      <button
        onClick={() => setSelected("SHORT")}
        style={{
          background: "#ff3333",
          padding: "8px 12px",
          borderRadius: 6,
          border: selected === "SHORT" ? "2px solid #fff" : "none",
          cursor: "pointer"
        }}
      >
        SHORT
      </button>

    </div>
  );
}