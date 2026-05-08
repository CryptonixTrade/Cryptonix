"use client";

import { signIn, getSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

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

        <div className="planCard">
          <h3>Monthly</h3>
          <p>$20 / month</p>

          <button
  disabled={!agreed}
  onClick={() => {
    if (!agreed) return;

    handleCheckout("monthly");
  }}
  style={{
    opacity: agreed ? 1 : 0.5,
    cursor: agreed ? "pointer" : "not-allowed",
  }}
>
 Buy Access
</button>
        </div>

        <div className="planCard">
          <h3>3 Months</h3>
          <p>$40</p>

          <button
  disabled={!agreed}
  onClick={() => {
    if (!agreed) return;

    handleCheckout("3months");
  }}
  style={{
    opacity: agreed ? 1 : 0.5,
    cursor: agreed ? "pointer" : "not-allowed",
  }}
>
  Buy Access
</button>
        </div>

        <div className="planCard">
          <h3>Yearly</h3>
          <p>$70</p>

          <button
  disabled={!agreed}
  onClick={() => {
    if (!agreed) return;

    handleCheckout("yearly");
  }}
  style={{
    opacity: agreed ? 1 : 0.5,
    cursor: agreed ? "pointer" : "not-allowed",
  }}
>
  Buy Access
</button>

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

          width: 100vw;
          height: 100vh;

          background: url('/CRYPTONIX.PNG') no-repeat center center;
          background-size: cover;

          z-index: 0;
        }

        @media (max-width: 768px) {
          .container {
            background: url('/CRYPTONIX-mobile.png') no-repeat center;
            background-size: cover;
          }
        }

        .overlay {
          position: fixed;
          inset: 0;

          background: rgba(132, 89, 73, 0.05);

          z-index: 1;

          pointer-events: none;
        }

        .loginBox {
          position: absolute;

          top: 40px;
          right: 40px;

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

        .plans {
          position: fixed;

          left: 40px;
          bottom: 40px;

          z-index: 9999;

          display: flex;
          gap: 5px;
        }

        .planCard {
          width: 115px;

          background: rgba(73, 53, 14, 0);

          backdrop-filter: blur(12px);

          border-radius: 17px;

          padding: 8px;

          color: white;

          border: 1px solid rgba(66, 193, 15, 0.75);
        }

        .planCard h3 {
          margin-bottom: 1px;
        }

        .planCard p {
          margin-bottom: 1px;
        }

        .planCard button {
          width: 100%;

          padding: 1px;

          border: none;

          border-radius: 12px;

          cursor: pointer;

          color: white;

          background: linear-gradient(
            135deg,
            rgb(64, 112, 5),
            rgb(125, 167, 64)
          );
        }
        

.footerLinks {
  position: fixed;
  left: 10spx;
  bottom: 6px;
  z-index: 9999;
}

.termsLabel {
  display: flex;
  align-items: center;
  gap: 10px;

  color: rgba(230, 232, 215, 0.99);
  font-size: 20px;
}

/* MOBILE */
@media (max-width: 768px) {

  .plans {
    bottom: 70px;
  }

}{

  .footerLinks {
    position: relative;

    left: auto;
    bottom: auto;

    margin-top: 18px;

    display: flex;
    justify-content: center;

    width: 100%;
  }

}

  .termsLabel {
    font-size: 14px;

    padding: 0 16px;

    text-align: center;

    flex-wrap: wrap;

    justify-content: center;
  }

}

.footerLinks a {
  color: rgba(116, 137, 96, 0.99);

  text-decoration: none;

  font-size: 16px;

  transition: 0.2s ease;
}

.footerLinks a:hover {
  color: #f0c36a;
}

       @media (max-width: 768px) {

  .loginBox {
    top: 16px;
    right: 16px;

    width: 118px;

    padding: 7px;

    border-radius: 18px;

    backdrop-filter: blur(18px);

    background: rgba(20, 5, 5, 0.72);

    box-shadow:
      0 0 20px rgba(255, 120, 0, 0.18),
      inset 0 0 12px rgba(255, 180, 0, 0.06);
  }

  .loginBox input {
    font-size: 11px;

    padding: 5px;

    margin-bottom: 6px;

    border-radius: 8px;
  }

  .loginBox button {
    font-size: 8px;

    padding: 6px;

    border-radius: 999px;
  }

  .plans {
    position: fixed;

    left: 14px;
    bottom: 30px;

    z-index: 9999;

    display: flex;

    flex-direction: row;

    gap: 5px;
  }

  .planCard {
    width: 118px;

    padding: 8px;

    border-radius: 22px;

    background: rgba(8, 8, 8, 0.55);

    border: 1px solid rgba(194, 155, 63, 0.28);

    backdrop-filter: blur(16px);

    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.4),
      inset 0 0 10px rgba(255, 215, 120, 0.05);

    overflow: hidden;
  }

  .planCard h3 {
    font-size: 11px;

    font-weight: 700;

    letter-spacing: 0.5px;

    margin-bottom: 4px;

    color: #f4d27a;
  }

  .planCard p {
    font-size: 11px;

    color: rgb(8, 246, 12);

    margin-bottom: -7px;
  }

  .planCard button {
    width: 100%;

    padding: 3px;

    font-size: 8px;

    font-weight: 600;

    border: none;

    border-radius: 999px;

    color: #1b1400;

    background: linear-gradient(
      90deg,
      #a26b00,
      #f5d06a,
      #8d5b00
    );

    background-size: 200% auto;

    box-shadow:
      0 4px 14px rgba(214, 162, 26, 0.35);

    transition: all 0.3s ease;
  }

  .planCard button:active {
    transform: scale(0.97);
  }
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

    </div>
  );
}