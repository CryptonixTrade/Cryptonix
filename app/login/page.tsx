"use client";

import { signIn, getSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import CryptoModal from "../components/CryptoModal";
import BinancePartnerCard from "../components/BinancePartnerCard";
import CryptonixPortal from "../components/CryptonixPortal";
import "../components/cryptonixPortal.css";

const legacyTabletFallbackScript = `
(function () {
  if (window.__cryptonixLegacyLoginFallback) return;
  window.__cryptonixLegacyLoginFallback = true;

  function isTabletWidth() {
    return window.innerWidth >= 600 && window.innerWidth <= 1180;
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

  function addTap(el, fn) {
    var lastTouch = 0;
    if (!el) return;
    el.addEventListener("touchend", function (event) {
      lastTouch = Date.now();
      event.preventDefault();
      event.stopPropagation();
      fn(event);
    }, false);
    el.addEventListener("click", function (event) {
      if (Date.now() - lastTouch < 700) return;
      event.stopPropagation();
      fn(event);
    }, false);
  }

  function ensureStyle() {
    if (document.getElementById("cryptonix-legacy-fallback-style")) return;
    var style = document.createElement("style");
    style.id = "cryptonix-legacy-fallback-style";
    style.type = "text/css";
    style.appendChild(document.createTextNode(
      ".legacyPaymentOverlay{position:fixed;z-index:2147483000;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.84);}" +
      ".legacyPaymentModal{position:relative;width:360px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;padding:22px;border:1px solid rgba(255,170,0,.16);border-radius:24px;background:rgba(12,12,12,.97);box-shadow:0 0 40px rgba(255,140,0,.1);color:#fff;text-align:center;font-family:Arial,sans-serif;}" +
      ".legacyPaymentModal button{touch-action:manipulation;cursor:pointer;}" +
      ".legacyCloseBtn{position:absolute;right:14px;top:10px;border:0;background:transparent;color:rgba(255,255,255,.7);font-size:28px;line-height:32px;}" +
      ".legacyPaymentTitle{margin:0 0 8px;color:#f0c36a;font-size:24px;}" +
      ".legacyNetwork{margin:0 0 14px;color:rgba(255,255,255,.75);}" +
      ".legacyAmount{margin:6px 0 14px;color:#ffd36b;font-size:32px;font-weight:700;}" +
      ".legacyQrBox{display:flex;justify-content:center;margin:0 auto 16px;padding:16px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,180,0,.08);}" +
      ".legacyQrBox img{width:170px;height:170px;}" +
      ".legacyWalletBox{margin-bottom:12px;padding:12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,180,0,.08);word-break:break-all;font-size:13px;}" +
      ".legacyCopyBtn,.legacyPaidBtn{width:100%;margin-bottom:12px;padding:12px;border:0;border-radius:999px;font-weight:700;}" +
      ".legacyCopyBtn{background:rgba(255,255,255,.08);color:#fff;}" +
      ".legacyPaidBtn{background:linear-gradient(90deg,#a26b00,#f5d06a);color:#000;}" +
      ".legacyEmailInput{box-sizing:border-box;width:100%;margin-bottom:12px;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff;}" +
      ".legacyAboutText{text-align:left;line-height:1.65;color:rgba(255,255,255,.88);font-size:15px;}"
    ));
    document.head.appendChild(style);
  }

  function encodeForm(data) {
    var parts = [];
    var key;
    for (key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
      }
    }
    return parts.join("&");
  }

  function postJson(url, data) {
    return fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (res) {
      return res.json();
    });
  }

  function closeLegacyModal() {
    var overlay = document.getElementById("cryptonix-legacy-modal");
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  function openPayment(plan, amount) {
    var wallet = "TWo1iyUNwYFh63qRuN7grd4eJmu4LDes3p";
    ensureStyle();
    closeLegacyModal();

    var overlay = document.createElement("div");
    overlay.id = "cryptonix-legacy-modal";
    overlay.className = "legacyPaymentOverlay";
    overlay.innerHTML =
      '<div class="legacyPaymentModal">' +
      '<button type="button" class="legacyCloseBtn" data-legacy-close="1">×</button>' +
      '<h2 class="legacyPaymentTitle">Pay with USDT</h2>' +
      '<p class="legacyNetwork">Network: TRC20</p>' +
      '<div>' + plan + '</div>' +
      '<div class="legacyAmount">' + amount + ' USDT</div>' +
      '<div style="margin-bottom:14px;color:#ff7b7b;font-size:12px;">ONLY SEND VIA TRC20 NETWORK</div>' +
      '<div class="legacyQrBox"><img src="/usdt-wallet-qr.svg" alt="USDT wallet QR"></div>' +
      '<div class="legacyWalletBox">' + wallet + '</div>' +
      '<button type="button" class="legacyCopyBtn" data-legacy-copy="1">Copy Wallet</button>' +
      '<input class="legacyEmailInput" type="email" placeholder="Your Email">' +
      '<button type="button" class="legacyPaidBtn" data-legacy-paid="1">I HAVE PAID</button>' +
      '</div>';

    document.body.appendChild(overlay);
    addTap(qs("[data-legacy-close]", overlay), closeLegacyModal);
    addTap(qs("[data-legacy-copy]", overlay), function () {
      var copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(wallet);
        copied = true;
      }
      if (!copied) window.prompt("Copy wallet", wallet);
    });
    addTap(qs("[data-legacy-paid]", overlay), function () {
      var emailInput = qs(".legacyEmailInput", overlay);
      var email = emailInput ? emailInput.value : "";
      if (!email) {
        alert("Enter email");
        return;
      }
      postJson("/api/crypto-payment", {
        plan: plan,
        amount: amount,
        email: email
      }).then(function (data) {
        if (data && data.success) {
          alert("Payment request sent");
          closeLegacyModal();
        } else {
          alert("Failed");
        }
      }).catch(function () {
        alert("Error sending request");
      });
    });
  }

  function openAbout() {
    ensureStyle();
    closeLegacyModal();
    var overlay = document.createElement("div");
    overlay.id = "cryptonix-legacy-modal";
    overlay.className = "legacyPaymentOverlay";
    overlay.innerHTML =
      '<div class="legacyPaymentModal">' +
      '<button type="button" class="legacyCloseBtn" data-legacy-close="1">×</button>' +
      '<h2 class="legacyPaymentTitle">About Cryptonix</h2>' +
      '<div class="legacyAboutText">' +
      '<p>Cryptonix is an AI-powered crypto intelligence platform designed to simplify market analysis through modern technology and premium AI systems.</p>' +
      '<p>The platform combines advanced market monitoring, intelligent analysis, and futuristic tools to help users stay connected with important market activity in real time.</p>' +
      '<p>Support email: support@cryptonix.life</p>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    addTap(qs("[data-legacy-close]", overlay), closeLegacyModal);
  }

  function fallbackLogin(form) {
    var formInputs = qsa("input", form);
    var usernameInput = formInputs[0];
    var passwordInput = qs('input[type="password"]', form) || formInputs[1];
    var username = usernameInput ? usernameInput.value : "";
    var password = passwordInput ? passwordInput.value : "";
    if (!username || !password) {
      alert("Enter username and password");
      return;
    }

    fetch("/api/auth/csrf", { credentials: "same-origin" })
      .then(function (res) { return res.json(); })
      .then(function (csrf) {
        return fetch("/api/auth/callback/credentials", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodeForm({
            username: username,
            password: password,
            redirect: "false",
            json: "true",
            csrfToken: csrf.csrfToken || "",
            callbackUrl: window.location.origin + "/dashboard"
          })
        });
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.url && data.url.indexOf("error=") !== -1) {
          alert("Неверный логин или пароль");
          return;
        }
        return fetch("/api/auth/session", { credentials: "same-origin" })
          .then(function (res) { return res.json(); })
          .then(function (session) {
            if (session && session.user && session.user.role === "admin") {
              window.location.href = "/admin/users";
            } else {
              window.location.href = "/dashboard";
            }
          });
      })
      .catch(function () {
        alert("Login error");
      });
  }

  function startFallback() {
    if (!isTabletWidth()) return;

    var root = qs(".loginPageRoot");
    if (!root) return;

    var terms = qs('.termsLabel input[type="checkbox"]', root);
    var buttons = qsa(".planCard .cryptoBtn", root);

    function syncPlans() {
      var agreed = terms && terms.checked;
      var i;
      for (i = 0; i < buttons.length; i += 1) {
        buttons[i].setAttribute("aria-disabled", agreed ? "false" : "true");
      }
    }

    if (terms) {
      terms.removeAttribute("checked");
      terms.checked = false;
      terms.addEventListener("change", syncPlans, false);
      terms.addEventListener("click", function () { setTimeout(syncPlans, 0); }, false);
      terms.addEventListener("touchend", function () { setTimeout(syncPlans, 0); }, false);
      syncPlans();
    }

    if (buttons[0]) addTap(buttons[0], function () {
      if (!terms || !terms.checked) return;
      openPayment("Monthly Plan", "3");
    });
    if (buttons[1]) addTap(buttons[1], function () {
      if (!terms || !terms.checked) return;
      openPayment("3 Months Plan", "10");
    });
    if (buttons[2]) addTap(buttons[2], function () {
      if (!terms || !terms.checked) return;
      openPayment("Yearly Plan", "20");
    });

    addTap(qs(".portal-button", root), openAbout);

    var form = qs(".loginBox", root);
    if (form) {
      addTap(qs('button[type="submit"]', form), function (event) {
        event.preventDefault();
        var usernameInput = qs('input[name="username"]', form);
        var passwordInput = qs('input[name="password"]', form);
        if (!usernameInput || !usernameInput.value || !passwordInput || !passwordInput.value) {
          alert("Enter username and password");
          return;
        }
        form.submit();
      });
    }
  }

  ready(function () {
    setTimeout(startFallback, 1200);
  });
}());
`;

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [cryptoOpen, setCryptoOpen] = useState(false);
const [selectedPlan, setSelectedPlan] = useState("");
const [selectedAmount, setSelectedAmount] = useState("");

  const openCryptoModal = (
    plan: string,
    amount: string
  ) => {
  
    if (!agreed && !termsRef.current?.checked) return;
  
    setSelectedPlan(plan);
    setSelectedAmount(amount);
  
    setCryptoOpen(true);
  };

  const handleAgreement = (
    e: ChangeEvent<HTMLInputElement> | MouseEvent<HTMLInputElement> | FormEvent<HTMLInputElement>
  ) => {
    setAgreed((e.currentTarget as HTMLInputElement).checked);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (window as any).__cryptonixReactReady = true;
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await signOut({ redirect: false });

      await new Promise((r) => setTimeout(r, 150));

      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (!res?.ok) {
        alert("Неверный логин или пароль");
        setLoading(false);
        return;
      }

      const session = await getSession();

      if (session?.user?.role === "admin") {
        window.location.href = "/admin/users";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
	    <div className="container loginPageRoot">

<picture>

  {/* MOBILE */}
  <source
    media="(max-width: 599px)"
    srcSet="/CRYPTONIX-mobile.png"
  />

  {/* TABLET */}
  <source
    media="(min-width: 600px) and (max-width: 1180px)"
    srcSet="/planshet.png"
  />

  {/* DESKTOP */}
  <img
    src="/CRYPTONIX.PNG"
    alt="bg"
    className="bgImage"
  />

</picture>

	      <div className="loginOverlay" />

      <div className="loginTopBar">
        <div className="loginBrandLockup">
          <div className="loginMiniMark">
            <span />
            <span />
          </div>
          <span>CRYPTONIX</span>
        </div>

        <div className="loginNavPill">
          AI Wealth OS
        </div>
      </div>

      <section className="loginHeroStage">
        <div className="cxBrandMark loginBrandMark">
          <span className="cxBrandNode cxBrandNodeTl" />
          <span className="cxBrandNode cxBrandNodeTr" />
          <span className="cxBrandNode cxBrandNodeBl" />
          <span className="cxBrandNode cxBrandNodeBr" />
          <span className="cxBrandBar cxBrandBarA" />
          <span className="cxBrandBar cxBrandBarB" />
          <span className="cxBrandCircuit cxBrandCircuitLeft" />
          <span className="cxBrandCircuit cxBrandCircuitRight" />
        </div>

        <div className="loginEyebrow">Private AI market intelligence</div>

        <h1>
          Command the future
          <span>of digital wealth.</span>
        </h1>

        <p>
          A cinematic trading cockpit built for clarity, signal discipline,
          and premium decision flow.
        </p>

        <div className="loginHeroMetrics">
          <span>Neural signals</span>
          <span>Live market pulse</span>
          <span>USDT access</span>
        </div>
      </section>
      
      <CryptonixPortal />

	      <form
	        action="/api/legacy-login"
	        method="post"
	        onSubmit={handleLogin}
	        className="loginBox"
	      >
	        <input
	          ref={inputRef}
	          name="username"
	          type="text"
	          placeholder="Username"
	          autoComplete="username"
	          required
	          value={username}
	          onChange={(e) => setUsername(e.target.value)}
	        />
	
	        <input
	          name="password"
	          type="password"
	          placeholder="Password"
	          autoComplete="current-password"
	          required
	          value={password}
	          onChange={(e) => setPassword(e.target.value)}
	        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>



<div className="plans">




  

  {/* MONTHLY */}
  <div className="planCard">
    <h3>Monthly</h3>

    <p>$3 / month</p>

    <div className="planButtons">

      <button
      type="button"
        className="cryptoBtn"
        aria-disabled={!agreed}
        onClick={() =>
          openCryptoModal(
            "Monthly Plan",
            "3"
          )
        }
      >
        Pay with USDT
      </button>

    </div>
  </div>

  {/* 3 MONTHS */}
  <div className="planCard">
    <h3>3 Months</h3>

    <p>$10</p>

    <div className="planButtons">

      <button
      type="button"
        className="cryptoBtn"
        aria-disabled={!agreed}
        onClick={() =>
          openCryptoModal(
            "3 Months Plan",
            "10"
          )
        }
      >
        Pay with USDT
      </button>

    </div>
  </div>

  {/* YEARLY */}
  <div className="planCard">
    <h3>Yearly</h3>

    <p>$20</p>

    <div className="planButtons">

      <button
      type="button"
        className="cryptoBtn"
        aria-disabled={!agreed}
        onClick={() =>
          openCryptoModal(
            "Yearly Plan",
            "20"
          )
        }
      >
        Pay with USDT
      </button>

    </div>
  </div>

</div>



      <div className="footerLinks">
  <label className="termsLabel">



	    <input
	      ref={termsRef}
	      type="checkbox"
	      checked={agreed}
	      onChange={handleAgreement}
	      onClick={handleAgreement}
	      onInput={handleAgreement}
	    />



    <span>
      I agree to the :{" "}
      <a href="/terms">
        Terms of Service and Privacy Policy
      </a>
    </span>

  </label>
</div>

<div className="binanceWrapper">
<BinancePartnerCard agreed={agreed} />
</div>





      <style jsx>{`

.binanceWrapper {
  position: fixed;

  left: 10px;
  right: 10px;

  bottom: 8px;

  z-index: 99999;

  display: flex;

  justify-content: center;
}

        .container {
  position: fixed;
  inset: 0;

  left: 0;
  right: 0;

  width: 100vw;
  height: 100vh;
  height: 100dvh;

  overflow: hidden;

  background: #000;
}

.bgImage {
  position: fixed;

  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;
  height: 100dvh;

  object-fit: cover;

  z-index: 0;
}

.cryptoBtn {
  margin-top: auto !important;

  background: linear-gradient(
    135deg,
    #c88900,
    #ffd54f
  ) !important;

  color: #1a1200 !important;

  box-shadow:
    0 0 14px rgba(255, 187, 0, 0.22);
}

        @media (max-width: 599px) {
          .container {
            background: url('/CRYPTONIX-mobile.png') no-repeat center;
            background-size: cover;
          }
        }

        @media (min-width: 600px) and (max-width: 1180px) {
          .container {
            background: url('/planshet.png') no-repeat center;
            background-size: cover;
          }

          .bgImage {
            object-position: center center;
          }
        }

        .loginOverlay {
          position: absolute;
          inset: 0;

          background: rgba(132, 89, 73, 0.05);

          z-index: 1;

          pointer-events: none;
        }

        .loginBox {
          position: absolute;
          max-width: calc(100vw - 40px);
          top: 30px;
          right: 30px;

          z-index: 2;

          width: 220px;
          max-width: calc(100% - 40px);

          background: rgba(103, 69, 34, 0);

          backdrop-filter: blur(12px);

          padding: 12px;

          border-radius: 12px;

          border: 1px solid rgba(117, 13, 13, 0.08);

          box-shadow: 0 0 25px rgba(91, 59, 19, 0.7);

          text-align: center;

          color: white;

          animation: fadeIn 0.5s ease;
        }

        .loginBox input {
          width: 100%;

          padding: 1px;

          margin-bottom: 3px;

          border-radius: 5px;

          border: 1px solid rgba(74, 3, 3, 0.1);

          background: rgba(53, 3, 3, 0.6);

          color: white;

          font-size: 12px;
        }

        .loginBox button {
          width: 100%;

          padding: 6px;

          border-radius: 66px;

          border: none;

          background: linear-gradient(
            135deg,
            rgb(71, 36, 2),
            rgb(106, 67, 23)
          );

          font-weight: bold;

          cursor: pointer;
        }

        .loginBox button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* =========================================
   PRICING
========================================= */

/* =========================================
   PRICING
========================================= */

.plans {
  position: fixed;

  left: 20px;
  bottom: 50px;

  z-index: 999;

  display: flex;

  gap: 4px;

  align-items: flex-end;
}

.planCard {
  width: 99px;

  padding: 4px;

  border-radius: 16px;

  background:
    linear-gradient(
      180deg,
      rgba(20,20,20,0.92),
      rgba(10,10,10,0.96)
    );

  border: 1px solid rgba(255, 201, 94, 0.24);

  backdrop-filter: blur(18px);

  box-shadow:
    0 12px 40px rgba(0,0,0,0.45),
    inset 0 0 16px rgba(255,215,120,0.04);

  display: flex;

  flex-direction: column;

  align-items: center;

  gap: 6px;
}

.planCard h3 {
  margin: 0;

  font-size: 14px;

  font-weight: 800;

  line-height: 1.1;

  color: #f6d27b;

  text-align: center;
}

.planCard p {
  margin: 0;

  font-size: 16px;

  font-weight: 900;

  line-height: 1.1;

  color: #8dff7d;

  text-align: center;
}

.planButtons {
  display: flex;

  flex-direction: column;

  gap: 5px;

  width: 100%;

  align-items: center;
}

.planCard button {
  width: 70%;

  height: 18px;

  border: none;

  border-radius: 999px;

  font-size: 9.5px;

  font-weight: 700;

  letter-spacing: 0.2px;

  cursor: pointer;

  transition: 0.2s ease;

  padding: 0 8px;

  display: flex;

  align-items: center;

  justify-content: center;

  line-height: 1;
  touch-action: manipulation;
}

.buyBtn {
  background:
    linear-gradient(
      135deg,
      #78ff5a,
      #9cff54
    );

  color: #132000;

  box-shadow:
    0 0 6px rgba(120,255,80,0.15);
}

.cryptoBtn {
  background:
    linear-gradient(
      135deg,
      #d8a021,
      #ffd54f
    );

  color: #241700;

  box-shadow:
    0 0 6px rgba(255,190,0,0.16);
}

.planCard button:hover {
  transform: translateY(-2px);
}

.planCard button:disabled {
  opacity: 0.28;

  cursor: not-allowed;

  transform: none;
}

.planCard button[aria-disabled="true"] {
  opacity: 0.28;

  cursor: not-allowed;

  transform: none;
}


/* =========================================
   TERMS
========================================= */

.binanceWrapper {
  position: fixed;

  left: 20px;

  bottom: 145px;

  z-index: 999;

  width: 305px;
}

@media (max-width: 599px) {
  .binanceWrapper {
    left: 10px;
    right: 10px;

    bottom: 112px;

    width: auto;
  }
}


.footerLinks {
  position: fixed;

  left: 24px;
  bottom: 20px;

  z-index: 999;
}

.termsLabel {
  display: flex;

  align-items: center;

  gap: 7px;

  color: white;

  font-size: 14px;
}

.termsLabel input {
  width: 18px;
  height: 18px;
}

.footerLinks a {
  color:rgb(240, 185, 75);

  text-decoration: none;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 599px) {

  .plans {
    left: 10px;
    right: 10px;

    bottom: 38px;

    justify-content: center;

    gap: 4px;

    flex-wrap: wrap;
  }

  .planCard {
    width: 75px;

    padding: 2px;

    border-radius: 17px;

    gap: 1px;
  }

  .planCard h3 {
    font-size: 8px;
  }

  .planCard p {
    font-size: 8px;
  }

  .planCard {
  position: relative;

  overflow: hidden;
}

.planCard::before {
  content: "";

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1px;

  background:
    linear-gradient(
      145deg,
      rgba(255,210,120,0.22),
      rgba(255,255,255,0.03)
    );

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  pointer-events: none;
}

    .planCard::before {
  content: "";

  position: absolute;

  inset: 0;

  border-radius: inherit;

  padding: 1px;

  background:
    linear-gradient(
      145deg,
      rgba(255,210,120,0.22),
      rgba(255,255,255,0.03)
    );

  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);

  -webkit-mask-composite: xor;

  pointer-events: none;
}

  .planButtons {
    gap: 3px;
  }

  .planCard button {
    min-height: 22px;

    font-size: 9px;

    padding: 4px;
  }

  .footerLinks {
    left: 10px;
    right: 10px;

    bottom: 17px;

    display: flex;

    justify-content: center;
  }

  .termsLabel {
    font-size: 11px;

    text-align: center;
  }
}

  .planCard button:active {
    transform: scale(0.97);
  }

@media (min-width: 600px) and (max-width: 1180px) {
  .loginBox {
    top: 28px;
    right: 28px;
    width: 230px;
    max-width: 230px;
    padding: 10px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.16);
  }

  .loginBox input {
    min-height: 24px;
    padding: 4px 8px;
    margin-bottom: 5px;
    font-size: 12px;
  }

  .loginBox button {
    min-height: 28px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .plans {
    left: 24px;
    right: auto;
    bottom: 72px;
    gap: 8px;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .planCard {
    width: 108px;
    padding: 7px 6px;
    gap: 6px;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(20,20,20,0.9), rgba(8,8,8,0.96));
  }

  .planCard h3 {
    font-size: 13px;
  }

  .planCard p {
    font-size: 15px;
  }

  .planCard button {
    width: 86%;
    height: 24px;
    min-height: 24px;
    font-size: 10px;
    padding: 0 8px;
  }

  .binanceWrapper {
    left: 24px;
    right: auto;
    bottom: 178px;
    width: 340px;
  }

  .footerLinks {
    left: 26px;
    right: auto;
    bottom: 30px;
    display: block;
  }

  .termsLabel {
    font-size: 13px;
    text-align: left;
    text-shadow: 0 1px 8px rgba(0,0,0,0.85);
  }

  .termsLabel input {
    width: 16px;
    height: 16px;
  }

  .tgFloat {
    right: 18px;
    bottom: 22px;
    width: 56px;
    height: 56px;
  }

  .tgButton {
    width: 56px;
    height: 56px;
  }

  .tgIcon {
    width: 24px;
    height: 24px;
  }
}

/* =========================================
   CRYPTONIX LUXURY ENTRY PASS
========================================= */

.bgImage {
  transform: scale(1.015);
  filter: saturate(0.86) contrast(1.08) brightness(0.72);
}

.loginOverlay {
  background:
    linear-gradient(90deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0.48) 34%, rgba(0,0,0,0.34) 58%, rgba(0,0,0,0.72) 100%),
    linear-gradient(180deg, rgba(0,0,0,0.38), rgba(0,0,0,0.08) 42%, rgba(0,0,0,0.74)),
    radial-gradient(circle at 50% 38%, rgba(242,213,138,0.12), transparent 38%);
}

.loginTopBar {
  position: fixed;
  top: 22px;
  left: 30px;
  right: 30px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.loginBrandLockup {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.88);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.22em;
}

.loginMiniMark {
  position: relative;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(242,213,138,0.24);
  border-radius: 12px;
  background: rgba(255,255,255,0.055);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.12),
    0 0 26px rgba(242,213,138,0.12);
}

.loginMiniMark span {
  position: absolute;
  left: 7px;
  top: 14px;
  width: 16px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b5e18, #f2d58a, #8b5e18);
}

.loginMiniMark span:first-child {
  transform: rotate(45deg);
}

.loginMiniMark span:last-child {
  transform: rotate(-45deg);
}

.loginNavPill {
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.055);
  color: rgba(255,255,255,0.68);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.06em;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.loginHeroStage {
  position: fixed;
  left: clamp(28px, 6vw, 96px);
  top: 15vh;
  z-index: 3;
  width: min(560px, 45vw);
  color: white;
  pointer-events: none;
  animation: loginReveal 1s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.loginBrandMark {
  width: 132px;
  height: 122px;
  margin-bottom: 28px;
}

.loginEyebrow {
  color: rgba(255,255,255,0.54);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.loginHeroStage h1 {
  margin: 18px 0 0;
  max-width: 660px;
  color: #fff;
  font-size: clamp(48px, 6.2vw, 92px);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 0.95;
}

.loginHeroStage h1 span {
  display: block;
  color: rgba(255,255,255,0.72);
}

.loginHeroStage p {
  margin: 24px 0 0;
  max-width: 470px;
  color: rgba(255,255,255,0.62);
  font-size: 18px;
  line-height: 1.55;
}

.loginHeroMetrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.loginHeroMetrics span {
  border: 1px solid rgba(255,255,255,0.11);
  border-radius: 999px;
  padding: 9px 12px;
  background: rgba(255,255,255,0.055);
  color: rgba(255,255,255,0.62);
  font-size: 12px;
  font-weight: 650;
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.loginBox {
  position: fixed;
  top: clamp(96px, 14vh, 148px);
  right: clamp(24px, 5vw, 74px);
  z-index: 18;
  width: 330px;
  max-width: calc(100vw - 48px);
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.13);
  border-radius: 30px;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.13), rgba(255,255,255,0.035)),
    rgba(0,0,0,0.34);
  box-shadow:
    0 34px 110px rgba(0,0,0,0.48),
    0 0 80px rgba(242,213,138,0.06),
    inset 0 1px 0 rgba(255,255,255,0.14);
  -webkit-backdrop-filter: blur(28px);
  backdrop-filter: blur(28px);
  animation: loginReveal 0.9s 0.12s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.loginBox input {
  height: 48px;
  margin-bottom: 12px;
  padding: 0 16px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  background: rgba(0,0,0,0.28);
  color: #fff;
  font-size: 14px;
  outline: none;
}

.loginBox input::placeholder {
  color: rgba(255,255,255,0.42);
}

.loginBox input:focus {
  border-color: rgba(242,213,138,0.35);
  box-shadow: 0 0 0 4px rgba(242,213,138,0.08);
}

.loginBox button {
  height: 48px;
  margin-top: 2px;
  border-radius: 999px;
  color: #15100a;
  background:
    linear-gradient(
      135deg,
      #8b5e18,
      #d7a84f,
      #f2d58a
    );
  font-size: 14px;
  font-weight: 750;
  box-shadow:
    0 18px 38px rgba(0,0,0,0.28),
    0 0 30px rgba(242,213,138,0.14);
}

.planCard {
  width: 154px;
  padding: 16px;
  gap: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.025)),
    rgba(0,0,0,0.38);
  box-shadow:
    0 24px 76px rgba(0,0,0,0.42),
    inset 0 1px 0 rgba(255,255,255,0.11);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  animation: loginReveal 0.9s 0.22s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.planCard h3 {
  color: rgba(255,255,255,0.76);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0;
}

.planCard p {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.plans {
  left: clamp(24px, 5vw, 76px);
  bottom: 58px;
  gap: 12px;
}

.cryptoBtn {
  width: 100% !important;
  height: 34px !important;
  background:
    linear-gradient(
      135deg,
      #8b5e18,
      #d7a84f,
      #f2d58a
    ) !important;
  box-shadow:
    0 10px 26px rgba(0,0,0,0.28),
    0 0 20px rgba(215,168,79,0.12);
  font-size: 10px !important;
  letter-spacing: 0.02em !important;
}

.termsLabel {
  color: rgba(244,239,227,0.88);
  text-shadow: 0 1px 10px rgba(0,0,0,0.8);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.footerLinks {
  left: clamp(24px, 5vw, 76px);
  bottom: 22px;
}

.footerLinks a {
  color: #f2d58a;
}

@keyframes loginReveal {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.985);
    filter: blur(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@media (max-width: 900px) {
  .loginOverlay {
    background:
      linear-gradient(180deg, rgba(0,0,0,0.72), rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.82)),
      radial-gradient(circle at 50% 38%, rgba(242,213,138,0.11), transparent 42%);
  }

  .loginTopBar {
    top: 14px;
    left: 14px;
    right: 14px;
  }

  .loginNavPill {
    display: none;
  }

  .loginBrandLockup {
    font-size: 11px;
    letter-spacing: 0.18em;
  }

  .loginHeroStage {
    left: 16px;
    right: 16px;
    top: 68px;
    width: auto;
  }

  .loginBrandMark {
    display: none;
  }

  .loginEyebrow {
    font-size: 10px;
  }

  .loginHeroStage h1 {
    max-width: 360px;
    margin-top: 12px;
    font-size: 38px;
    letter-spacing: -0.035em;
  }

  .loginHeroStage p,
  .loginHeroMetrics {
    display: none;
  }

  .loginBox {
    top: 172px;
    left: 14px;
    right: 14px;
    width: auto;
    max-width: none;
    padding: 14px;
    border-radius: 22px;
  }

  .loginBox input {
    height: 40px;
    margin-bottom: 8px;
    border-radius: 14px;
    font-size: 13px;
  }

  .loginBox button {
    height: 42px;
  }

  .plans {
    left: 12px;
    right: 12px;
    bottom: 66px;
    gap: 8px;
    flex-wrap: nowrap;
    justify-content: center;
  }

  .planCard {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    padding: 10px 8px;
    border-radius: 20px;
    gap: 6px;
  }

  .planCard h3 {
    font-size: 11px;
  }

  .planCard p {
    font-size: 15px;
  }

  .cryptoBtn {
    height: 28px !important;
    font-size: 8.5px !important;
    padding: 0 6px !important;
  }

  .binanceWrapper {
    left: 12px;
    right: 12px;
    bottom: 170px;
    width: auto;
  }

  .footerLinks {
    left: 12px;
    right: 58px;
    bottom: 20px;
    display: flex;
    justify-content: flex-start;
  }

  .termsLabel {
    font-size: 10.5px;
    line-height: 1.25;
    text-align: left;
  }

  .termsLabel input {
    flex: 0 0 auto;
    width: 15px;
    height: 15px;
  }
}

@media (min-width: 600px) and (max-width: 1180px) {
  .loginHeroStage {
    left: 34px;
    top: 90px;
    width: 48vw;
  }

  .loginBrandMark {
    display: block;
    width: 94px;
    height: 88px;
    margin-bottom: 18px;
  }

  .loginHeroStage h1 {
    font-size: clamp(42px, 6vw, 68px);
  }

  .loginHeroStage p {
    display: block;
    max-width: 360px;
    font-size: 14px;
  }

  .loginBox {
    top: 92px;
    right: 30px;
    left: auto;
    width: 284px;
    padding: 18px;
  }

  .plans {
    left: 30px;
    right: auto;
    bottom: 78px;
    gap: 10px;
  }

  .planCard {
    width: 126px;
    flex: 0 0 auto;
  }

  .binanceWrapper {
    left: 30px;
    right: auto;
    bottom: 196px;
    width: 340px;
  }

  .footerLinks {
    left: 30px;
    right: auto;
    bottom: 32px;
  }
}

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

/* =========================================
   TELEGRAM VIP AI BUTTON
========================================= */

.tgFloat {
  position: fixed;

  right: 18px;
  bottom: 18px;

  width: 68px;
  height: 68px;

  z-index: 999999;

  display: flex;

  align-items: center;
  justify-content: center;

  text-decoration: none;
}

/* MAIN BUTTON */

.tgButton {
  position: relative;

  width: 68px;
  height: 68px;

  border-radius: 999px;

  display: flex;

  align-items: center;
  justify-content: center;

  background:
    radial-gradient(
      circle at top,
      rgba(242,213,138,0.16),
      rgba(0,0,0,0.96)
    );

  border: 1px solid rgba(242,213,138,0.24);

  backdrop-filter: blur(18px);

  overflow: hidden;

  box-shadow:
    0 0 18px rgba(215,168,79,0.18),
    0 0 45px rgba(215,168,79,0.10),
    inset 0 0 20px rgba(255,255,255,0.03);

  transition: all 0.3s ease;
}

.tgButton:hover {
  transform:
    scale(1.08)
    translateY(-2px);

  box-shadow:
    0 0 30px rgba(215,168,79,0.26),
    0 0 70px rgba(215,168,79,0.14);
}

/* ICON */

.tgIcon {
  width: 30px;
  height: 30px;

  color: #f2d58a;

  z-index: 5;

  filter:
    drop-shadow(0 0 10px rgba(215,168,79,0.58));
}

/* PULSE */

.tgPulse {
  position: absolute;

  width: 68px;
  height: 68px;

  border-radius: 999px;

  background:
    radial-gradient(
      circle,
      rgba(242,213,138,0.14),
      transparent 70%
    );

  animation: tgPulseAnim 3s infinite;

  z-index: 0;
}

/* ORBIT */

.tgOrbit {
  position: absolute;

  width: 88px;
  height: 88px;

  border-radius: 999px;

  border:
    1px solid rgba(242,213,138,0.12);

  animation:
    tgRotate 12s linear infinite;

  z-index: 0;
}

.tgOrbit::before {
  content: "";

  position: absolute;

  top: -3px;
  left: 50%;

  transform: translateX(-50%);

  width: 6px;
  height: 6px;

  border-radius: 999px;

  background: #f2d58a;

  box-shadow:
    0 0 10px rgba(215,168,79,0.8);
}

/* PARTICLES */

.tgParticles span {
  position: absolute;

  width: 4px;
  height: 4px;

  border-radius: 999px;

  background: rgba(242,213,138,0.9);

  box-shadow:
    0 0 10px rgba(215,168,79,0.8);

  animation:
    tgParticleFloat 4s infinite ease-in-out;
}

.tgParticles span:nth-child(1) {
  top: 10%;
  left: 20%;
}

.tgParticles span:nth-child(2) {
  top: 20%;
  right: 10%;

  animation-delay: 1s;
}

.tgParticles span:nth-child(3) {
  bottom: 18%;
  left: 12%;

  animation-delay: 2s;
}

.tgParticles span:nth-child(4) {
  bottom: 10%;
  right: 18%;

  animation-delay: 1.5s;
}

/* ANIMATIONS */

@keyframes tgRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes tgPulseAnim {

  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.18);
    opacity: 0.2;
  }

  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

@keyframes tgParticleFloat {

  0% {
    transform:
      translateY(0px)
      scale(1);

    opacity: 0.3;
  }

  50% {
    transform:
      translateY(-8px)
      scale(1.4);

    opacity: 1;
  }

  100% {
    transform:
      translateY(0px)
      scale(1);

    opacity: 0.3;
  }
}

@media (max-width: 599px) {

  .tgFloat {
    right: 6px;
    bottom: 57px;

    width: 42px;
    height: 42px;
  }

  .tgButton {
    width: 37px;
    height: 37px;

    border-width: 1px;

    box-shadow:
      0 0 12px rgba(215,168,79,0.16),
      0 0 24px rgba(215,168,79,0.08);
  }

  .tgIcon {
    width: 16px;
    height: 16px;

    filter:
      drop-shadow(0 0 5px rgba(215,168,79,0.55));
  }

  .tgOrbit {
    width: 56px;
    height: 56px;
  }

  .tgPulse {
    width: 42px;
    height: 42px;
  }

  .tgParticles span {
    width: 2px;
    height: 2px;
  }
}

      `}</style>

      <CryptoModal
        open={cryptoOpen}
        onClose={() => setCryptoOpen(false)}
        plan={selectedPlan}
        amount={selectedAmount}
      />

<a
  href="https://t.me/cryptonix_life_official"
  target="_blank"
  rel="noopener noreferrer"
  className="tgFloat"
>

  {/* ORBIT */}
  <div className="tgOrbit" />

  {/* PULSE */}
  <div className="tgPulse" />

  {/* PARTICLES */}
  <div className="tgParticles">
    <span />
    <span />
    <span />
    <span />
  </div>

  {/* MAIN BUTTON */}
  <div className="tgButton">

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="tgIcon"
    >
      <path d="M21.5 2.5L2.9 9.6c-1.3.5-1.3 1.3-.2 1.6l4.8 1.5 1.8 5.5c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.4-16c.3-1.2-.5-1.8-1.5-1.4z"/>
    </svg>

  </div>
</a>

<script
  dangerouslySetInnerHTML={{
    __html: legacyTabletFallbackScript,
  }}
/>

	    </div>
	  );
	}
