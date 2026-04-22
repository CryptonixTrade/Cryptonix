"use client";

export default function Timeframes({ interval, setIntervalState }: any) {

  const tf = ["1m","3m","5m","15m","30m","1h","2h","4h","12h","1d","1w","1M"];

  return (
    <div className="w-full">

      <div className="flex flex-wrap gap-2">

        {tf.map((t) => {

          const active = interval === t;

          return (
            <button
              key={t}
              onClick={() => {
                if (t === interval) return;
                setIntervalState(t);
              }}
              disabled={active}
              className={`
                px-3 py-2 text-xs md:text-sm rounded-md transition-all duration-150
                ${active
                  ? "bg-yellow-400 text-black border border-yellow-400 cursor-default"
                  : "bg-[#111] text-gray-400 border border-[#222] hover:bg-[#1a1a1a] hover:text-white"
                }
              `}
            >
              {t}
            </button>
          );
        })}

      </div>

    </div>
  );
}