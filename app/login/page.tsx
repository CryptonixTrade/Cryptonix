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
          height: 100vh;
          width: 100%;
          background-image: url('/CRYPTONIX.PNG');
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
        }

        .loginBox {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 220px;
          background: rgba(15, 15, 15, 0.85);
          backdrop-filter: blur(12px);
          padding: 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.7);
          text-align: center;
          color: white;
          animation: fadeIn 0.5s ease;
        }

        .loginBox input {
          width: 100%;
          padding: 8px;
          margin-bottom: 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 14px;
        }

        .loginBox button {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: none;
          background: linear-gradient(135deg, #f0b90b, #ffd700);
          font-weight: bold;
          cursor: pointer;
        }

        .loginBox button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .loginBox {
            top: 50%;
            left: 50%;
            right: auto;
            transform: translate(-50%, -50%);
            width: 85%;
            max-width: 300px;
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