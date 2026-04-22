"use client";

export default function Timeframes({ interval, setIntervalState }: any) {

  const tf = ["1m","3m","5m","15m","30m","1h","2h","4h","12h","1d","1w","1M"];

  return (
    <div style={{ marginBottom: 10 }}>

      <div style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }}>
        {tf.map((t) => {

          const active = interval === t;

          return (
            <button
              key={t}
              onClick={() => {
                if (t === interval) return; // 🔥 защита от спама
                setIntervalState(t);
              }}
              disabled={active}
              style={{
                padding: "5px 10px",
                fontSize: 11,
                borderRadius: 4,
                cursor: active ? "default" : "pointer",
                border: active
                  ? "1px solid #ffd700"
                  : "1px solid #222",
                background: active ? "#ffd700" : "#111",
                color: active ? "#000" : "#aaa",
                opacity: active ? 1 : 0.8,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.color = "#fff";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "#111";
                  e.currentTarget.style.color = "#aaa";
                }
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

    </div>
  );
}