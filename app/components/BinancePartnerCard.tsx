export default function BinancePartnerCard({
    agreed,
  }: {
    agreed: boolean;
  }) {
    const isMobile =
      typeof window !== "undefined" &&
      window.innerWidth <= 768;
  
    return (
      <a
        href="https://www.binance.com/register?ref=LIFECRYPTO"
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
            if (!agreed) {
              e.preventDefault();
            }
          }}
        style={{
            width: isMobile ? "94px" : "139px",
          
            opacity: agreed ? 1 : 0.35,
            cursor: agreed
            ? "pointer"
            : "not-allowed",
          
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          
            padding: isMobile
              ? "3px 8px"
              : "8px 10px",
          
            borderRadius: "12px",
          
            border:
              "1px solid rgba(240,185,11,0.18)",
          
            background:
              "rgba(0,0,0,0.34)",
          
            backdropFilter: "blur(12px)",
          
            textDecoration: "none",
          
            boxShadow:
              "0 0 10px rgba(240,185,11,0.08)",
          
            transition: "all 0.25s ease",
          }}
      >
        <div>
          <div
            style={{
              color: "rgba(244, 184, 5, 0.87)",
  
              fontSize: isMobile
                ? "9.5px"
                : "13px",
  
              fontWeight: 700,
  
              lineHeight: 1,
  
              letterSpacing: "0.2px",
            }}
          >


          </div>
  
          <div
            style={{
              marginTop: "2.5px",
  
              color:
                "rgba(186, 181, 13, 0.52)",
  
              fontSize: isMobile
                ? "7px"
                : "10px",
  
              lineHeight: 1,
            }}
          >
            Recommended by Cryptonix
          </div>
        </div>
  
        <div
  style={{
    padding: "2.5px 5px",

    borderRadius: "999px",

    background:
"rgba(116, 103, 8, 0.87)",

    boxShadow:
      "0 0 6px rgba(135, 115, 50, 0.12)",

    color: "rgb(150, 211, 28)",

    fontSize: "7px",

    fontWeight: 800,

    lineHeight: 1,
  }}
>
          Open Binance
        </div>
      </a>
    );
  }