"use client";

import { signIn, getSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import CryptoModal from "../components/CryptoModal";
import BinancePartnerCard from "../components/BinancePartnerCard";
import CryptonixPortal from "../components/CryptonixPortal";
import "../components/cryptonixPortal.css";

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
  
    if (!agreed) return;
  
    setSelectedPlan(plan);
    setSelectedAmount(amount);
  
    setCryptoOpen(true);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
    <div className="container">

<picture>

  {/* MOBILE */}
  <source
    media="(max-width: 768px)"
    srcSet="/CRYPTONIX-mobile.png"
  />

  {/* DESKTOP */}
  <img
    src="/CRYPTONIX.PNG"
    alt="bg"
    className="bgImage"
  />

</picture>

      <div className="overlay" />
      
      <CryptonixPortal />

      <form onSubmit={handleLogin} className="loginBox">
        <input
          ref={inputRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
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
        disabled={!agreed}
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
        disabled={!agreed}
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
        disabled={!agreed}
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
      type="checkbox"
      checked={agreed}
      onChange={(e) => setAgreed(e.target.checked)}
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

  overflow: hidden;

  background: #000;
}

.bgImage {
  position: fixed;

  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

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

        @media (max-width: 768px) {
          .container {
            background: url('/CRYPTONIX-mobile.png') no-repeat center;
            background-size: cover;
          }
        }

        .overlay {
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

@media (max-width: 768px) {
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

@media (max-width: 768px) {

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
      rgba(0,255,255,0.18),
      rgba(0,0,0,0.96)
    );

  border: 1px solid rgba(0,255,255,0.32);

  backdrop-filter: blur(18px);

  overflow: hidden;

  box-shadow:
    0 0 18px rgba(0,255,255,0.16),
    0 0 45px rgba(0,255,255,0.12),
    inset 0 0 20px rgba(255,255,255,0.03);

  transition: all 0.3s ease;
}

.tgButton:hover {
  transform:
    scale(1.08)
    translateY(-2px);

  box-shadow:
    0 0 30px rgba(0,255,255,0.28),
    0 0 70px rgba(0,255,255,0.16);
}

/* ICON */

.tgIcon {
  width: 30px;
  height: 30px;

  color: #8ffcff;

  z-index: 5;

  filter:
    drop-shadow(0 0 10px rgba(0,255,255,0.65));
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
      rgba(0,255,255,0.18),
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
    1px solid rgba(0,255,255,0.12);

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

  background: #7df9ff;

  box-shadow:
    0 0 10px rgba(0,255,255,0.8);
}

/* PARTICLES */

.tgParticles span {
  position: absolute;

  width: 4px;
  height: 4px;

  border-radius: 999px;

  background: rgba(125,249,255,0.9);

  box-shadow:
    0 0 10px rgba(0,255,255,0.8);

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

@media (max-width: 768px) {

  .tgFloat {
    right: 6px;
    bottom: 57px;

    width: 42px;
    height: 2px;
  }

  .tgButton {
    width: 37px;
    height: 37px;

    border-width: 1px;

    box-shadow:
      0 0 12px rgba(0,255,255,0.16),
      0 0 24px rgba(0,255,255,0.08);
  }

  .tgIcon {
    width: 16px;
    height: 16px;

    filter:
      drop-shadow(0 0 5px rgba(0,255,255,0.55));
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

    </div>
  );
}
