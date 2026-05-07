"use client";

import { signIn, getSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
          <h3>MONTHLY</h3>
          <p>$20 / month</p>

          <button onClick={() => handlePay("monthly")}>
            Buy Access
          </button>
        </div>

        <div className="planCard">
          <h3>3 MONTHS</h3>
          <p>$40</p>

          <button onClick={() => handlePay("quarterly")}>
            Buy Access
          </button>
        </div>

        <div className="planCard">
          <h3>YEARLY</h3>
          <p>$70</p>

          <button onClick={() => handlePay("yearly")}>
            Buy Access
          </button>
        </div>

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

          background: rgba(152, 116, 103, 0.05);

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

          background: rgba(32, 4, 4, 0.85);

          backdrop-filter: blur(12px);

          padding: 18px;

          border-radius: 12px;

          border: 1px solid rgba(255, 255, 255, 0.08);

          box-shadow: 0 0 25px rgba(205, 10, 10, 0.7);

          text-align: center;

          color: white;

          animation: fadeIn 0.5s ease;
        }

        .loginBox input {
          width: 100%;

          padding: 6px;

          margin-bottom: 8px;

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
            rgb(142, 78, 5)
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

          background: rgba(8, 12, 0, 0.6);

          backdrop-filter: blur(12px);

          border-radius: 17px;

          padding: 8px;

          color: white;

          border: 1px solid rgb(22, 72, 4);
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
            rgb(87, 54, 3),
            rgb(34, 56, 2)
          );
        }

        @media (max-width: 768px) {

  .loginBox {
    top: 20px;
    right: 20px;

    width: 85%;
    max-width: 125px;
  }

  .plans {
    left: 12px;
    bottom: 12px;

    flex-direction: column;

    gap: 3px;
  }

  .planCard {
    width: 105px;

    padding: 1px;
  }

  .planCard h3 {
    font-size: 5px;
  }

  .planCard p {
    font-size: 5px;
  }

  .planCard button {
    font-size: 5px;

    padding: 2px;

    border-radius: 4px;
  }
}

          .planCard {
            width: 105px;
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
      `}</style>
    </div>
  );
}