"use client";

type Decision = "LONG" | "SHORT" | "NO TRADE" | "EXPIRED";

type Props = {
  selected: "LONG" | "SHORT" | null;
  setSelected: (v: "LONG" | "SHORT" | null) => void;

  aiSignal?: {
    decision?: Decision;
    confidence?: number;
  } | null;
};

export default function TradeButtons(props: any) {

  const {
    selected = null,
    setSelected = () => {},
    aiSignal = null
  } = props;

  function handleClick(type: "LONG" | "SHORT") {
    if (selected === type) {
      setSelected(null);
    } else {
      setSelected(type);
    }
  }

  const aiDecision = aiSignal?.decision;
  const confidence = Math.round(aiSignal?.confidence || 0);

  const isBlocked = aiDecision === "NO TRADE";

  function getStyle(type: "LONG" | "SHORT") {

    const active = selected === type;
    const aiMatch = aiDecision === type;

    const baseColor = type === "LONG" ? "#00ff88" : "#ff3b3b";

    return {
      flex: 1,
      padding: "12px 0",
      borderRadius: 10,
      cursor: isBlocked ? "not-allowed" : "pointer",
      fontWeight: 700,
      letterSpacing: 1,
      position: "relative" as const,

      opacity: isBlocked ? 0.4 : 1,

      background: active
        ? `linear-gradient(135deg, ${baseColor}, ${baseColor}cc)`
        : "rgba(0,0,0,0.6)",

      color: active ? "#000" : baseColor,

      border: `1px solid ${
        active
          ? baseColor
          : aiMatch
          ? `${baseColor}`
          : `${baseColor}66`
      }`,

      boxShadow: active
        ? `0 0 18px ${baseColor}`
        : aiMatch
        ? `0 0 12px ${baseColor}66`
        : `inset 0 0 10px ${baseColor}22`,

      transition: "all 0.2s ease"
    };
  }

  return (
    <div style={{
      display: "flex",
      gap: 12,
      marginBottom: 16,

      background: "rgba(15,15,15,0.6)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,215,0,0.08)",
      borderRadius: 12,
      padding: 6,
      boxShadow: "0 0 25px rgba(255,180,0,0.05)",
      position: "relative"
    }}>

      {/* GOLD LINE */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: "linear-gradient(to right, transparent, rgba(255,215,0,0.4), transparent)"
      }}/>

      {/* LONG */}
      <button
        onClick={() => !isBlocked && handleClick("LONG")}
        style={getStyle("LONG")}
      >
        LONG

        {aiDecision === "LONG" && (
          <div style={{
            position: "absolute",
            bottom: 2,
            right: 6,
            fontSize: 9,
            opacity: 0.7
          }}>
            {confidence}%
          </div>
        )}
      </button>

      {/* SHORT */}
      <button
        onClick={() => !isBlocked && handleClick("SHORT")}
        style={getStyle("SHORT")}
      >
        SHORT

        {aiDecision === "SHORT" && (
          <div style={{
            position: "absolute",
            bottom: 2,
            right: 6,
            fontSize: 9,
            opacity: 0.7
          }}>
            {confidence}%
          </div>
        )}
      </button>

      {/* BRAND */}
      <div style={{
        position: "absolute",
        bottom: -16,
        right: 4,
        fontSize: 9,
        letterSpacing: 2,
        color: "#ffd700",
        opacity: 0.15
      }}>
        CRYPTONIX
      </div>

    </div>
  );
}