import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import Cryptonix from "./Cryptonix";

const tabletTerminalScript = `
(function () {
  if (window.__cryptonixTabletTerminalFallback) return;
  window.__cryptonixTabletTerminalFallback = true;

  function isTablet() {
    return window.innerWidth >= 600 && window.innerWidth <= 1180;
  }

  if (!isTablet()) return;

  var state = {
    symbol: "BTCUSDT",
    interval: "1m",
    coins: [],
    candles: [],
    prices: {
      price: 0,
      btcSpot: 0,
      btcFutures: 0
    }
  };

  function el(id) {
    return document.getElementById(id);
  }

  function fmt(value) {
    var number = Number(value || 0);
    if (!number) return "--";
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function request(path, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/market-data?" + path, true);
    xhr.timeout = 15000;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          cb(null, JSON.parse(xhr.responseText));
        } catch (error) {
          cb(error);
        }
      } else {
        cb(new Error("Request failed " + xhr.status));
      }
    };
    xhr.ontimeout = function () {
      cb(new Error("Request timeout"));
    };
    xhr.send();
  }

  function setText(id, value) {
    var node = el(id);
    if (node) node.innerHTML = value;
  }

  function updateHeader() {
    setText("tabletSymbol", state.symbol);
    setText("tabletPair", state.symbol);
    setText("tabletChartPair", state.symbol);
    setText("tabletPrice", "$" + fmt(state.prices.price));
    setText("tabletSpot", fmt(state.prices.btcSpot));
    setText("tabletFutures", fmt(state.prices.btcFutures));
  }

  function drawChart() {
    var canvas = el("tabletChartCanvas");
    if (!canvas || !canvas.getContext) return;

    var parent = canvas.parentNode;
    var width = parent ? parent.clientWidth : 700;
    var height = parent ? parent.clientHeight : 360;
    var ratio = window.devicePixelRatio || 1;

    canvas.width = Math.max(320, width) * ratio;
    canvas.height = Math.max(300, height) * ratio;
    canvas.style.width = Math.max(320, width) + "px";
    canvas.style.height = Math.max(300, height) + "px";

    var ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "rgba(10,10,12,0.35)";
    ctx.fillRect(0, 0, width, height);

    var candles = state.candles.slice(-80);
    if (!candles.length) {
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText("LOADING MARKET DATA", width / 2, height / 2);
      return;
    }

    var max = -Infinity;
    var min = Infinity;
    for (var i = 0; i < candles.length; i += 1) {
      max = Math.max(max, candles[i].high);
      min = Math.min(min, candles[i].low);
    }

    var pad = 22;
    var range = max - min || 1;
    var step = (width - pad * 2) / candles.length;

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (var g = 0; g < 5; g += 1) {
      var yGrid = pad + ((height - pad * 2) / 4) * g;
      ctx.beginPath();
      ctx.moveTo(pad, yGrid);
      ctx.lineTo(width - pad, yGrid);
      ctx.stroke();
    }

    for (var c = 0; c < candles.length; c += 1) {
      var item = candles[c];
      var x = pad + c * step + step / 2;
      var highY = pad + (max - item.high) / range * (height - pad * 2);
      var lowY = pad + (max - item.low) / range * (height - pad * 2);
      var openY = pad + (max - item.open) / range * (height - pad * 2);
      var closeY = pad + (max - item.close) / range * (height - pad * 2);
      var up = item.close >= item.open;

      ctx.strokeStyle = up ? "#2dff87" : "#ff5e5e";
      ctx.fillStyle = up ? "rgba(45,255,135,0.72)" : "rgba(255,94,94,0.72)";
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      var bodyTop = Math.min(openY, closeY);
      var bodyHeight = Math.max(2, Math.abs(openY - closeY));
      ctx.fillRect(x - Math.max(2, step * 0.28), bodyTop, Math.max(4, step * 0.56), bodyHeight);
    }

    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    ctx.fillText(fmt(max), width - 8, pad + 4);
    ctx.fillText(fmt(min), width - 8, height - pad);
  }

  function calculateSignal() {
    var candles = state.candles;
    if (candles.length < 20) {
      setText("tabletAiSignal", "LOADING");
      setText("tabletConfidence", "0%");
      return;
    }

    var last = candles[candles.length - 1];
    var prev = candles[candles.length - 12];
    var change = ((last.close - prev.close) / prev.close) * 100;
    var decision = "NO TRADE";
    var confidence = Math.min(88, Math.round(Math.abs(change) * 18 + 28));

    if (change > 0.18) decision = "LONG";
    if (change < -0.18) decision = "SHORT";
    if (decision === "NO TRADE") confidence = 0;

    setText("tabletAiSignal", decision);
    setText("tabletConfidence", confidence + "%");
  }

  function loadPrices() {
    request("type=prices&symbol=" + encodeURIComponent(state.symbol), function (error, data) {
      if (error || !data) return;
      state.prices = data;
      updateHeader();
      setText("tabletCurrentPrice", "$" + fmt(data.price));
    });
  }

  function loadCandles() {
    request(
      "type=klines&symbol=" + encodeURIComponent(state.symbol) +
        "&interval=" + encodeURIComponent(state.interval) +
        "&limit=120",
      function (error, data) {
        if (error || !data || !data.map) return;
        state.candles = data.map(function (c) {
          return {
            time: c[0] / 1000,
            open: Number(c[1]),
            high: Number(c[2]),
            low: Number(c[3]),
            close: Number(c[4]),
            volume: Number(c[5])
          };
        });
        drawChart();
        calculateSignal();
      }
    );
  }

  function renderCoinList(list) {
    var box = el("tabletCoinResults");
    if (!box) return;
    var html = "";
    for (var i = 0; i < list.length && i < 50; i += 1) {
      var coin = list[i];
      html += '<button type="button" class="tabletCoin" data-symbol="' + coin.symbol + '">' +
        '<span>' + coin.symbol.replace("USDT", "") + '</span>' +
        '<small>$' + fmt(coin.lastPrice) + '</small>' +
      '</button>';
    }
    box.innerHTML = html || '<div class="tabletMuted">No markets found</div>';
  }

  function loadCoins() {
    request("type=tickers", function (error, data) {
      if (error || !data || !data.filter) return;
      state.coins = data.filter(function (coin) {
        return coin.symbol && coin.symbol.indexOf("USDT") > -1;
      });
      renderCoinList(state.coins);
    });
  }

  function refreshAll() {
    updateHeader();
    loadPrices();
    loadCandles();
  }

  function bind() {
    var search = el("tabletSearch");
    var results = el("tabletCoinResults");
    var timeframe = document.querySelectorAll("[data-tablet-interval]");

    if (search) {
      search.onkeyup = function () {
        var value = String(search.value || "").toUpperCase();
        var filtered = state.coins.filter(function (coin) {
          return coin.symbol.indexOf(value) > -1;
        });
        renderCoinList(filtered);
      };
      search.onfocus = function () {
        if (results) results.style.display = "block";
      };
    }

    if (results) {
      results.onclick = function (event) {
        var target = event.target;
        while (target && !target.getAttribute("data-symbol")) {
          target = target.parentNode;
        }
        if (!target) return;
        state.symbol = target.getAttribute("data-symbol") || "BTCUSDT";
        if (search) search.value = "";
        results.style.display = "none";
        refreshAll();
      };
    }

    for (var i = 0; i < timeframe.length; i += 1) {
      timeframe[i].onclick = function () {
        for (var n = 0; n < timeframe.length; n += 1) {
          timeframe[n].className = "tabletTf";
        }
        this.className = "tabletTf active";
        state.interval = this.getAttribute("data-tablet-interval") || "1m";
        loadCandles();
      };
    }
  }

  function start() {
    var shell = el("tabletTerminalFallback");
    if (!shell) return;
    shell.style.display = "block";
    bind();
    loadCoins();
    refreshAll();
    window.setInterval(loadPrices, 5000);
    window.setInterval(loadCandles, 20000);
    window.addEventListener("resize", function () {
      if (isTablet()) drawChart();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}());
`;

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-160px] right-[-120px] h-[360px] w-[360px] rounded-full bg-yellow-500/10 blur-3xl" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            #tabletTerminalFallback {
              display: none;
            }

            @media (min-width: 600px) and (max-width: 1180px) {
              .dashboardReactShell {
                display: none !important;
              }

              #tabletTerminalFallback {
                min-height: 100vh;
                padding: 10px;
                background: #070707;
                color: #f4bd57;
                font-family: Arial, sans-serif;
              }

              .tabletTop {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                padding: 12px;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 18px;
                background: rgba(12,12,14,.72);
              }

              .tabletBrand {
                font-size: 20px;
                font-weight: 800;
                letter-spacing: .18em;
              }

              .tabletPair {
                margin-top: 4px;
                color: rgba(255,255,255,.86);
                font-size: 15px;
              }

              .tabletPrice {
                color: #fff;
                font-size: 26px;
                font-weight: 800;
                text-align: right;
              }

              .tabletSub {
                color: rgba(255,255,255,.45);
                font-size: 11px;
                letter-spacing: .14em;
              }

              .tabletControls {
                display: flex;
                gap: 10px;
                margin: 10px 0;
              }

              .tabletSearchWrap {
                position: relative;
                width: 220px;
              }

              #tabletSearch {
                box-sizing: border-box;
                width: 100%;
                padding: 10px 12px;
                border: 1px solid rgba(255,255,255,.12);
                border-radius: 14px;
                background: rgba(255,255,255,.04);
                color: #fff;
                outline: none;
              }

              #tabletCoinResults {
                display: none;
                position: absolute;
                z-index: 50;
                top: 44px;
                left: 0;
                width: 320px;
                max-height: 280px;
                overflow-y: auto;
                padding: 8px;
                border: 1px solid rgba(255,255,255,.12);
                border-radius: 16px;
                background: rgba(9,9,10,.98);
              }

              .tabletCoin {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                margin-bottom: 5px;
                padding: 9px;
                border: 1px solid rgba(255,255,255,.07);
                border-radius: 12px;
                background: rgba(255,255,255,.04);
                color: #fff;
                font-weight: 700;
              }

              .tabletCoin small {
                color: rgba(255,255,255,.5);
              }

              .tabletTfRow {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                align-items: center;
              }

              .tabletTf {
                min-width: 40px;
                padding: 9px 10px;
                border: 1px solid rgba(255,255,255,.08);
                border-radius: 999px;
                background: rgba(255,255,255,.04);
                color: rgba(255,255,255,.76);
                font-weight: 700;
              }

              .tabletTf.active {
                background: linear-gradient(135deg,#c88900,#ffd54f);
                color: #1a1200;
              }

              .tabletChartCard,
              .tabletPanel {
                margin-top: 10px;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 18px;
                background: rgba(12,12,14,.72);
                overflow: hidden;
              }

              .tabletCardHead {
                display: flex;
                justify-content: space-between;
                padding: 12px;
                border-bottom: 1px solid rgba(255,255,255,.08);
                letter-spacing: .14em;
                color: #f4bd57;
                font-weight: 800;
              }

              .tabletChartArea {
                height: 430px;
              }

              .tabletPanelGrid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
                padding: 14px;
                color: #fff;
              }

              .tabletPanelBox {
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 16px;
                padding: 12px;
                background: rgba(255,255,255,.035);
              }

              .tabletPanelLabel {
                color: rgba(255,255,255,.48);
                font-size: 11px;
                letter-spacing: .15em;
              }

              .tabletPanelValue {
                margin-top: 8px;
                color: #fff;
                font-size: 24px;
                font-weight: 800;
              }

              .tabletMuted {
                padding: 16px;
                color: rgba(255,255,255,.45);
                text-align: center;
              }
            }
          `,
        }}
      />

      <div className="dashboardReactShell relative z-10">
        <Cryptonix />
      </div>

      <div id="tabletTerminalFallback">
        <div className="tabletTop">
          <div>
            <div className="tabletBrand">CRYPTONIX</div>
            <div className="tabletPair" id="tabletSymbol">BTCUSDT</div>
            <div className="tabletSub">AI TRADING TERMINAL</div>
          </div>
          <div>
            <div className="tabletPrice" id="tabletPrice">$--</div>
            <div className="tabletSub">REAL-TIME MARKET DATA</div>
            <div className="tabletSub">
              SPOT <span id="tabletSpot">--</span> / FUTURES <span id="tabletFutures">--</span>
            </div>
          </div>
        </div>

        <div className="tabletControls">
          <div className="tabletSearchWrap">
            <input id="tabletSearch" placeholder="Search market..." />
            <div id="tabletCoinResults" />
          </div>
          <div className="tabletTfRow">
            {["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "12h", "1d", "1w", "1M"].map((tf) => (
              <button
                className={tf === "1m" ? "tabletTf active" : "tabletTf"}
                data-tablet-interval={tf}
                key={tf}
                type="button"
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="tabletChartCard">
          <div className="tabletCardHead">
            <span>CRYPTONIX CHART</span>
            <span id="tabletChartPair">BTCUSDT</span>
          </div>
          <div className="tabletChartArea">
            <canvas id="tabletChartCanvas" />
          </div>
        </div>

        <div className="tabletPanel">
          <div className="tabletCardHead">
            <span>AI TRADE PANEL</span>
            <span>LIVE</span>
          </div>
          <div className="tabletPanelGrid">
            <div className="tabletPanelBox">
              <div className="tabletPanelLabel">CURRENT PRICE</div>
              <div className="tabletPanelValue" id="tabletCurrentPrice">$--</div>
            </div>
            <div className="tabletPanelBox">
              <div className="tabletPanelLabel">AI SIGNAL</div>
              <div className="tabletPanelValue" id="tabletAiSignal">LOADING</div>
            </div>
            <div className="tabletPanelBox">
              <div className="tabletPanelLabel">CONFIDENCE</div>
              <div className="tabletPanelValue" id="tabletConfidence">0%</div>
            </div>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: tabletTerminalScript,
        }}
      />
    </div>
  );
}
