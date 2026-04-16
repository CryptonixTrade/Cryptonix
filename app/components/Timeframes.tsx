"use client";

export default function Timeframes({ interval, setIntervalState }: any) {

  const tf = ["1m","3m","5m","15m","30m","1h","2h","4h","12h","1d","1w","1M"];

  return (
    <div style={{ marginBottom: 12 }}>

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
              onClick={() => setIntervalState(t)}
              style={{
                padding: "6px 10px",
                fontSize: 12,
                borderRadius: 4,
                cursor: "pointer",
                border: "1px solid #222",
                background: active ? "#ffd700" : "#111",
                color: active ? "#000" : "#aaa",
                transition: "0.2s"
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