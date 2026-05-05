"use client";

import { signIn, getSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 👈 защита

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    try {
      // 🔴 сбрасываем старую сессию
      await signOut({ redirect: false });

      // ⏱ даём время очиститься cookie (ВАЖНО)
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

      <style jsx>{`
        .container {
  position: fixed;   /* фиксируем к экрану */
  inset: 0;          /* top:0 right:0 bottom:0 left:0 */

  width: 100vw;      /* ширина окна */
  height: 100vh;     /* высота окна */

  background: url('/CRYPTONIX.PNG') no-repeat center center;
  background-size: cover;   /* КЛЮЧ — покрывает весь экран */

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
  background: rgba(9, 8, 8, 0.6);
  z-index: 1;
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
  padding:18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 25px rgba(205, 10, 10, 0.7);
  text-align: center;
  color: white;
  animation: fadeIn 0.5s ease;
}

        .loginBox input {
          width: 100%;
          padding: 2px;
          margin-bottom: 4px;
          border-radius: 5px;
          border: 1px solid rgba(42, 7, 7, 0.1);
          background: rgba(53, 3, 3, 0.6);
          color: white;
          font-size: 12px;
        }

        .loginBox button {
          width: 100%;
          padding: 2px;
          border-radius: 66px;
          border: none;
          background: linear-gradient(135deg,rgb(71, 36, 2),rgb(142, 78, 5));
          font-weight: bold;
          cursor: pointer;
        }

        .loginBox button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
  .loginBox {
    top: 20px;
    right: 20px;

    left: auto;
    transform: none;

    width: 85%;
    max-width: 125px;
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