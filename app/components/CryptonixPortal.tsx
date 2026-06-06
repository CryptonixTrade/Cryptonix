"use client";

import { useState } from "react";

export default function CryptonixPortal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* BUTTON */}
      <div className="portal-wrapper">

        <div className="orbit orbit1"></div>
        <div className="orbit orbit2"></div>
        <div className="orbit orbit3"></div>

        <button
          type="button"
          className="portal-button"
          onClick={() => setOpen(true)}
        >
          Explore Cryptonix
        </button>

      </div>

      {/* MODAL */}
      {open && (
        <div className="portal-modal active">

          <div className="portal-content">

            <button
              type="button"
              className="close-btn"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

          <h2>About Cryptonix</h2>

          <p>
            Cryptonix is an AI-powered crypto intelligence platform
            designed to simplify market analysis through modern
            technology and premium AI systems.
          </p>

          <p>
            The platform combines advanced market monitoring,
            intelligent analysis, and futuristic tools to help
            users stay connected with important market activity
            in real time.
          </p>

          <p>
            Built around speed, simplicity, and innovation,
            Cryptonix delivers a next-generation digital
            ecosystem for modern market participants.
            Cryptonix is more than just a crypto platform.
It is a new generation digital intelligence environment for modern market participants.
Support email: support@cryptonix.life
          </p>

          </div>

        </div>
      )}
    </>
  );
}
