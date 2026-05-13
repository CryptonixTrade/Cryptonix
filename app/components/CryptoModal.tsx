"use client";
import { useState } from "react";
import QRCode from "react-qr-code";

type Props = {
  open: boolean;
  onClose: () => void;
  plan: string;
  amount: string;
};

export default function CryptoModal({
  open,
  onClose,
  plan,
  amount,
}: Props) {

  if (!open) return null;

  const wallet =
"TWo1iyUNwYFh63qRuN7grd4eJmu4LDes3p";

const [email, setEmail] =
  useState("");

const [sending, setSending] =
  useState(false);

const [success, setSuccess] =
  useState(false);

  const submitPayment = async () => {
    try {
  
      setSending(true);
  
      const res = await fetch(
        "/api/crypto-payment",
        {
          method: "POST",
  
          headers: {
            "Content-Type":
              "application/json",
          },
  
          body: JSON.stringify({
            plan,
            amount,
            email,
          }),
        }
      );
  
      const data = await res.json();
  
      if (data.success) {
  
        setSuccess(true);
  
      } else {
  
        alert("Failed");
      }
  
    } catch (e) {
  
      console.error(e);
  
      alert("Error sending request");
  
    } finally {
  
      setSending(false);
    }
  };
  
  const copyWallet = async () => {

    try {
  
      await navigator.clipboard.writeText(
        wallet
      );
  
      alert("Wallet copied");
  
    } catch {
  
      alert("Copy failed");
    }
  };

  if (success) {

    return (
  
      <div className="overlay">
  
        <div className="modal">
  
          <h2>
            Payment Request Sent
          </h2>
  
          <p className="network">
            We will verify your payment
            shortly.
          </p>
  
          <button
            className="paidBtn"
            onClick={onClose}
          >
            Close
          </button>
  
        </div>
  
      </div>
    );
  }
  return (
    <div className="overlay">

      <div className="modal">

        <button
          className="closeBtn"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Pay with USDT</h2>

        <p className="network">
          Network: TRC20
        </p>

        <div className="plan">
          {plan}
        </div>

        <div className="amount">
          {amount} USDT
        </div>

        <div className="warning">
          ONLY SEND VIA TRC20 NETWORK
        </div>

        <div className="qrBox">

  <QRCode
    value={wallet}
    size={170}
    bgColor="transparent"
    fgColor="#f5d06a"
  />

</div>

<div className="walletBox">
  {wallet}
</div>

<button
  className="copyBtn"
  onClick={copyWallet}
>
  Copy Wallet
</button>

<input
  className="txInput"
  type="email"
  placeholder="Your Email"

  value={email}

  onChange={(e) =>
    setEmail(e.target.value)
  }
/>

<button
  className="paidBtn"

  onClick={submitPayment}

  disabled={
    sending || !email
  }
>

{sending
  ? "Sending..."
  : !email
  ? "ENTER EMAIL"
  : "I HAVE PAID"}

</button>

      </div>

      <style jsx>{`
        .overlay {
          position: fixed;
          inset: 0;

          background: rgba(0,0,0,0.82);

          backdrop-filter: blur(10px);

          display: flex;
          align-items: center;
          justify-content: center;

          z-index: 999999;
        }

.qrBox {
  display: flex;

  justify-content: center;

  margin-bottom: 18px;

  padding: 16px;

  border-radius: 18px;

  background:
    rgba(255,255,255,0.03);

  border:
    1px solid rgba(255,180,0,0.08);
}

.copyBtn {
  width: 100%;

  margin-bottom: 16px;

  padding: 10px;

  border: none;

  border-radius: 999px;

  cursor: pointer;

  background:
    rgba(255,255,255,0.08);

  color: white;

  transition: 0.2s ease;
}

.copyBtn:hover {
  background:
    rgba(255,255,255,0.14);
}

        .modal {
          width: 360px;
          max-width: calc(100vw - 24px);

          background:
            rgba(12,12,12,0.96);

          border:
            1px solid rgba(255,170,0,0.16);

          border-radius: 24px;

          padding: 22px;

          color: white;

          position: relative;

          box-shadow:
            0 0 40px rgba(255,140,0,0.08);
        }

        .closeBtn {
          position: absolute;

          right: 16px;
          top: 12px;

          background: none;
          border: none;

          color: rgba(255,255,255,0.6);

          font-size: 26px;

          cursor: pointer;
        }

        h2 {
          margin-bottom: 8px;

          color: #f0c36a;
        }

        .network {
          opacity: 0.7;

          margin-bottom: 18px;
        }

        .plan {
          font-size: 14px;

          margin-bottom: 8px;

          color: rgba(255,255,255,0.72);
        }

        .amount {
          font-size: 32px;
          font-weight: bold;

          margin-bottom: 18px;

          color: #ffd36b;
        }

        .warning {
          font-size: 12px;

          color: #ff7b7b;

          margin-bottom: 18px;
        }

        .walletBox {
          background:
            rgba(255,255,255,0.04);

          border:
            1px solid rgba(255,180,0,0.08);

          border-radius: 14px;

          padding: 12px;

          word-break: break-all;

          margin-bottom: 16px;

          font-size: 13px;
        }

        .txInput {
          width: 100%;

          padding: 12px;

          border-radius: 14px;

          border:
            1px solid rgba(255,255,255,0.08);

          background:
            rgba(255,255,255,0.04);

          color: white;

          margin-bottom: 16px;
        }

        .paidBtn {
          width: 100%;

          padding: 12px;

          border: none;

          border-radius: 999px;

          font-weight: bold;

          cursor: pointer;

          color: black;

          background:
            linear-gradient(
              90deg,
              #a26b00,
              #f5d06a
            );
        }
      `}</style>

    </div>
  );
}