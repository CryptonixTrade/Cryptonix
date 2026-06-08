"use client";
import { useState } from "react";
import QRCode from "react-qr-code";
import { USDT_NETWORK, USDT_WALLET } from "@/lib/payment-config";

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
const [email, setEmail] =
  useState("");

const [sending, setSending] =
  useState(false);

const [success, setSuccess] =
  useState(false);

  if (!open) return null;

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
        USDT_WALLET
      );
  
      alert("Wallet copied");
  
    } catch {
  
      alert("Copy failed");
    }
  };

  if (success) {

    return (
  
	      <div className="cryptoPaymentOverlay">
	  
	        <div className="cryptoPaymentModal">
  
          <h2>
            Payment Request Sent
          </h2>
  
          <p className="network">
            We will verify your payment
            shortly.
          </p>
  
          <button
            className="paidBtn"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
  
        </div>

        <style jsx>{`
          .cryptoPaymentOverlay {
            position: fixed;
            inset: 0;
            z-index: 2147483000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.86);
            -webkit-backdrop-filter: blur(10px);
            backdrop-filter: blur(10px);
            pointer-events: auto;
          }

          .cryptoPaymentModal {
            width: 360px;
            max-width: calc(100vw - 24px);
            padding: 22px;
            border: 1px solid rgba(242,213,138,0.18);
            border-radius: 24px;
            background: linear-gradient(180deg, rgba(18,16,13,0.98), rgba(7,7,8,0.98));
            color: white;
            box-shadow: 0 24px 80px rgba(0,0,0,0.55), 0 0 44px rgba(215,168,79,0.1);
          }

          .network {
            opacity: 0.7;
            margin-bottom: 18px;
          }

          .paidBtn {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 999px;
            font-weight: bold;
            cursor: pointer;
            color: black;
            background: linear-gradient(135deg, #8b5e18, #d7a84f, #f2d58a);
            touch-action: manipulation;
          }
        `}</style>
  
      </div>
    );
  }
  return (
	    <div className="cryptoPaymentOverlay">

	      <div className="cryptoPaymentModal">

        <button
          className="closeBtn"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Pay with USDT</h2>

        <p className="network">
          Network: {USDT_NETWORK}
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
    value={USDT_WALLET}
    size={170}
    bgColor="transparent"
    fgColor="#f5d06a"
  />

</div>

<div className="walletBox">
  {USDT_WALLET}
</div>

<button
  className="copyBtn"
  type="button"
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
  type="button"

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
	        .cryptoPaymentOverlay {
          position: fixed;
          inset: 0;

          background: rgba(0,0,0,0.86);

          backdrop-filter: blur(10px);

          display: flex;
          align-items: center;
          justify-content: center;

	          z-index: 2147483000;
	          pointer-events: auto;
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
	  touch-action: manipulation;
	}

.copyBtn:hover {
  background:
    rgba(255,255,255,0.14);
}

	        .cryptoPaymentModal {
          width: 360px;
          max-width: calc(100vw - 24px);

          background:
            linear-gradient(180deg, rgba(18,16,13,0.98), rgba(7,7,8,0.98));

          border:
            1px solid rgba(242,213,138,0.18);

          border-radius: 24px;

          padding: 22px;

          color: white;

          position: relative;

          box-shadow:
            0 24px 80px rgba(0,0,0,0.55),
            0 0 44px rgba(215,168,79,0.1);
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
	          z-index: 2;
	          touch-action: manipulation;
	        }

        h2 {
          margin-bottom: 8px;

          color: #f2d58a;
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

          color: #f2d58a;
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
	              #8b5e18,
	              #d7a84f,
	              #f2d58a
	            );
	          touch-action: manipulation;
	        }
      `}</style>

    </div>
  );
}
