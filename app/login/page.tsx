"use client";

import { signIn, getSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import CryptoModal from "../components/CryptoModal";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [cryptoOpen, setCryptoOpen] = useState(false);
const [selectedPlan, setSelectedPlan] = useState("");
const [selectedAmount, setSelectedAmount] = useState("");

  const handleCheckout = async (plan: string) => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

  
      const data = await res.json();
  
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

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

  async function handlePay(plan: string) {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          plan,
        }),
      });

      const data = await res.json();

      console.log("STRIPE:", data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Stripe error");
      }

    } catch (e) {
      console.error(e);
      alert("Checkout failed");
    }
  }

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

    <p>$20 / month</p>

    <div className="planButtons">

      <button
        className="buyBtn"
        disabled={!agreed}
        onClick={() => handleCheckout("monthly")}
      >
        Buy Access
      </button>

      <button
        className="cryptoBtn"
        disabled={!agreed}
        onClick={() =>
          openCryptoModal(
            "Monthly Plan",
            "20"
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

    <p>$40</p>

    <div className="planButtons">

      <button
        className="buyBtn"
        disabled={!agreed}
        onClick={() => handleCheckout("3months")}
      >
        Buy Access
      </button>

      <button
        className="cryptoBtn"
        disabled={!agreed}
        onClick={() =>
          openCryptoModal(
            "3 Months Plan",
            "40"
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

    <p>$70</p>

    <div className="planButtons">

      <button
        className="buyBtn"
        disabled={!agreed}
        onClick={() => handleCheckout("yearly")}
      >
        Buy Access
      </button>

      <button
        className="cryptoBtn"
        disabled={!agreed}
        onClick={() =>
          openCryptoModal(
            "Yearly Plan",
            "70"
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

      <style jsx>{`
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

  left: 24px;
  bottom: 70px;

  z-index: 999;

  display: flex;

  gap: 16px;

  align-items: flex-end;
}

.planCard {
  width: 155px;

  padding: 18px;

  border-radius: 24px;

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

  gap: 16px;
}

.planCard h3 {
  margin: 0;

  min-height: 58px;

  display: flex;

  align-items: flex-start;

  font-size: 20px;

  font-weight: 800;

  line-height: 1.15;

  letter-spacing: -0.3px;

  color: #f6d27b;
}

.planCard p {
  margin: 0;

  min-height: 35px;

  display: flex;

  align-items: center;

  font-size: 28px;

  font-weight: 900;

  line-height: 1;

  color: #8dff7d;

  letter-spacing: -1px;
}

.planCard::before {
  content: "";
  
  position: relative;

overflow: hidden;

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
  margin-top: auto;
}

.planButtons {
  display: flex;

  flex-direction: column;

  gap: 5px;

  margin-top: auto;
}

.planCard button {
  width: 100%;

  height: 22px;

  border: none;

  border-radius: 999px;

  font-size: 8px;

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
  opacity: 0.45;

  cursor: not-allowed;

  transform: none;
}

/* =========================================
   TERMS
========================================= */

.footerLinks {
  position: fixed;

  left: 24px;
  bottom: 20px;

  z-index: 999;
}

.termsLabel {
  display: flex;

  align-items: center;

  gap: 10px;

  color: white;

  font-size: 14px;
}

.termsLabel input {
  width: 16px;
  height: 16px;
}

.footerLinks a {
  color: #f0c36a;

  text-decoration: none;
}

/* =========================================
   MOBILE
========================================= */

@media (max-width: 768px) {

  .plans {
    left: 10px;
    right: 10px;

    bottom: 70px;

    justify-content: center;

    gap: 8px;

    flex-wrap: wrap;
  }

  .planCard {
    width: 102px;

    padding: 12px;

    border-radius: 18px;

    gap: 10px;
  }

  .planCard h3 {
    font-size: 14px;
  }

  .planCard p {
    font-size: 12px;
  }

  .planButtons {
    gap: 6px;
  }

  .planCard button {
    min-height: 34px;

    font-size: 10px;

    padding: 6px;
  }

  .footerLinks {
    left: 10px;
    right: 10px;

    bottom: 18px;

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

          .planCard {
            width: 105px;
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

`}</style>

<CryptoModal
  open={cryptoOpen}
  onClose={() => setCryptoOpen(false)}
  plan={selectedPlan}
  amount={selectedAmount}
/>

</div>
  );
}