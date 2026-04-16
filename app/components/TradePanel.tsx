"use client";

import { useEffect, useState } from "react";

export default function TradePanel({
  trade,
  selected,
  onTrade,
  price,
  aiSignal
}: any) {

  const [pnl, setPnl] = useState<number | null>(null);

  function formatPrice(p: number) {
    if (!p) return "--";
    if (p < 0.001) return p.toFixed(8);
    if (p < 1) return p.toFixed(6);
    if (p < 100) return p.toFixed(4);
    if (p < 1000) return p.toFixed(3);
    return p.toFixed(2);
  }

  // ===== PNL
  useEffect(() => {
    if (!trade || !price) {
      setPnl(null);
      return;
    }

    let result = 0;

    if (trade.type === "LONG") {
      result = ((price - trade.entry) / trade.entry) * 100;
    } else {
      result = ((trade.entry - price) / trade.entry) * 100;
    }

    setPnl(result);
  }, [price, trade]);

  const pnlColor =
    pnl === null ? "#999" : pnl >= 0 ? "#00ff66" : "#ff3b3b";

  const activeColor =
    selected === "LONG"
      ? "#00ff66"
      : selected === "SHORT"
      ? "#ff3b3b"
      : "#999";

  // ===== TOGGLE (НЕ ЛОМАЕМ)
  function handleClick(type: "LONG" | "SHORT") {
    if (selected === type) {
      onTrade(type);
    } else {
      onTrade(type);
    }
  }

  // ===== AI LOGIC
  const aiDecision = aiSignal?.decision || "NO TRADE";
  const aiConfidence = aiSignal?.confidence || 0;

  const isBlocked = aiDecision === "NO TRADE";

  return (
    <div style={{
      width: 260,
      background: "#0f0f0f",
      border: "1px solid #111",
      borderRadius: 10,
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }}>

      {/* HEADER */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center"
      }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>
          AI Trading
        </div>
      </div>

      {/* PRICE */}
      <div style={{
        fontSize: 20,
        color: "#ffd700",
        textAlign:"center"
      }}>
        {formatPrice(price || 0)}
      </div>

      {/* 🔥 AI STATUS */}
      <div style={{
        padding:10,
        borderRadius:8,
        background:"#111",
        fontSize:12,
        textAlign:"center",
        border: `1px solid ${
          aiDecision === "LONG"
            ? "#00ff6633"
            : aiDecision === "SHORT"
            ? "#ff3b3b33"
            : "#333"
        }`
      }}>
        <div style={{
          fontWeight:600,
          color:
            aiDecision === "LONG"
              ? "#00ff66"
              : aiDecision === "SHORT"
              ? "#ff3b3b"
              : "#999"
        }}>
          {aiDecision}
        </div>

        <div style={{ opacity:0.6 }}>
          {aiConfidence.toFixed(0)}% confidence
        </div>
      </div>

      {/* 🔥 MAIN ACTION */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>

        <button
          disabled={isBlocked}
          onClick={() => handleClick(aiDecision)}
          style={{
            background: isBlocked
              ? "#222"
              : aiDecision === "LONG"
              ? "#00ff66"
              : "#ff3b3b",
            color: isBlocked ? "#555" : "#000",
            padding: 12,
            borderRadius: 8,
            fontWeight:700,
            cursor: isBlocked ? "not-allowed" : "pointer",
            border:"none"
          }}
        >
          {isBlocked ? "NO TRADE" : `ENTER ${aiDecision}`}
        </button>

        {!isBlocked && (
          <div style={{
            fontSize:10,
            opacity:0.5,
            textAlign:"center"
          }}>
            Based on AI signal
          </div>
        )}

      </div>

      {/* 🔥 MANUAL CONTROL */}
      <div style={{ display: "flex", gap: 6, marginTop:6 }}>

        <button
          onClick={() => handleClick("LONG")}
          style={{
            flex: 1,
            background:
              selected === "LONG"
                ? "#00ff66"
                : "rgba(0,255,100,0.1)",
            color: selected === "LONG" ? "#000" : "#00ff66",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #003322",
            cursor: "pointer",
            fontSize:12
          }}
        >
          LONG
        </button>

        <button
          onClick={() => handleClick("SHORT")}
          style={{
            flex: 1,
            background:
              selected === "SHORT"
                ? "#ff3b3b"
                : "rgba(255,0,0,0.1)",
            color: selected === "SHORT" ? "#000" : "#ff3b3b",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #330000",
            cursor: "pointer",
            fontSize:12
          }}
        >
          SHORT
        </button>

      </div>

      {/* TRADE INFO */}
      {trade && (
        <div style={{
          marginTop: 8,
          padding: 12,
          background: "#111",
          borderRadius: 8,
          fontSize: 12,
          border: `1px solid ${activeColor}33`
        }}>

          <div style={{
            fontSize:13,
            fontWeight:600,
            color: activeColor,
            marginBottom:8,
            textAlign:"center"
          }}>
            {trade.type}
          </div>

          <div>Entry: {formatPrice(trade.entry)}</div>

          <div style={{ color:"#00ff66" }}>
            TP: {formatPrice(trade.take)}
          </div>

          <div style={{ color:"#ff3b3b" }}>
            SL: {formatPrice(trade.stop)}
          </div>

          <div style={{
            marginTop: 10,
            fontSize: 15,
            fontWeight: 700,
            color: pnlColor,
            textAlign:"center"
          }}>
            {pnl !== null ? pnl.toFixed(2) + "%" : "--"}
          </div>

        </div>
      )}

      {!trade && (
        <div style={{
          fontSize:11,
          textAlign:"center",
          opacity:0.5,
          marginTop:6
        }}>
          Waiting for entry
        </div>
      )}

    </div>
  );
}