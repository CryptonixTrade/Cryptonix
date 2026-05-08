"use client";

import { useState } from "react";

export default function TermsPage() {

  const [agreed, setAgreed] = useState(false);

    return (
      <div className="termsPage">
        <div className="overlay" />
  
        <div className="content">
          <h1>Terms of Service</h1>

          <a href="/" className="backBtn">
  ← Return to Cryptonix.life ←
</a>
  
          <p className="updated">
            Last updated: May 2026
          </p>
  
          <section>
            <h2>1. Introduction</h2>
  
            <p>
              Welcome to Cryptonix. By accessing or using this platform,
              you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>
  
          <section>
            <h2>2. Service Description</h2>
  
            <p>
              Cryptonix is an AI-powered crypto analytics and market
              intelligence platform designed to provide technical insights,
              informational trading signals, and analytical tools related
              to digital asset markets.
            </p>
  
            <p>
              The platform is intended for informational and educational
              purposes only.
            </p>
          </section>
  
          <section>
            <h2>3. No Financial Advice</h2>
  
            <p>
              Cryptonix does not provide financial, investment, legal,
              or tax advice.
            </p>
  
            <p>
              All content, signals, analytics, and information provided
              through the platform are for educational and informational
              purposes only and should not be interpreted as financial advice.
            </p>
          </section>
  
          <section>
            <h2>4. Risk Disclosure</h2>
  
            <p>
              Cryptocurrency markets are highly volatile and involve
              significant financial risk.
            </p>
  
            <p>
              Users are solely responsible for their own trading and
              investment decisions.
            </p>
          </section>
  
          <section>
            <h2>5. Subscription Terms</h2>
  
            <p>
              Certain features of Cryptonix require a paid subscription.
            </p>
  
            <p>
              Subscriptions renew automatically unless cancelled before
              the next billing cycle.
            </p>
  
            <p>
              Users may cancel their subscriptions at any time through
              the payment provider or account settings.
            </p>
          </section>
  
          <section>
            <h2>6. Refund Policy</h2>
  
            <p>
              All payments are generally non-refundable unless otherwise
              required by applicable law.
            </p>
  
            <p>
              Refund requests may be reviewed on a case-by-case basis.
            </p>
          </section>
  
          <section>
            <h2>7. User Responsibilities</h2>
  
            <p>
              Users agree not to misuse, exploit, copy, distribute,
              or resell any part of the platform without authorization.
            </p>
  
            <p>
              Users are responsible for maintaining the confidentiality
              of their account credentials.
            </p>
          </section>
  
          <section>
            <h2>8. Limitation of Liability</h2>
  
            <p>
              Cryptonix and its operators shall not be liable for any
              financial losses, damages, or consequences resulting from
              the use of the platform or reliance on its content.
            </p>
          </section>
  
          <section>
            <h2>9. Contact Information</h2>
  
            <p>
              For support or legal inquiries, please contact:
            </p>
  
            <p className="email">
              kot235235235@gmail.com
            </p>
          </section>
        </div>
  
        <style jsx>{`
          .termsPage {
            position: relative;
  
            min-height: 100vh;
  
            background:
              url('/CRYPTONIX.PNG') no-repeat center center;
  
            background-size: cover;
  
            color: white;
  
            padding: 80px 20px;
          }
  
.backBtn {
  display: inline-block;

  margin-bottom: 24px;

  color:rgb(144, 247, 19);

  text-decoration: none;

  font-size: 50px;

  transition: 0.2s ease;
}

.backBtn:hover {
  opacity: 0.8;
}

          .overlay {
            position: fixed;
            inset: 0;
  
            background: rgba(22, 4, 4, 0.72);
  
            backdrop-filter: blur(8px);
  
            z-index: 1;
          }
  
          .content {
            position: relative;
  
            z-index: 2;
  
            max-width: 900px;
  
            margin: 0 auto;
  
            background: rgba(26, 1, 1, 0.72);
  
            border: 1px solid rgba(28, 19, 19, 0.08);
  
            border-radius: 8px;
  
            padding: 30px;
  
            backdrop-filter: blur(20spx);
  
            box-shadow:
              0 0 40px rgba(211, 175, 175, 0.5);
          }
  
          h1 {
            font-size: 10px;
  
            margin-bottom: 42px;
  
            color:rgb(141, 112, 54);
          }
  
          .updated {
            opacity: 0.7;
  
            margin-bottom: 22px;
          }
  
          section {
            margin-bottom: 10px;
          }
  
          h2 {
            font-size: 17px;
  
            margin-bottom: 10px;
  
            color:rgb(220, 185, 115);
          }
  
          p {
            line-height: 1.8;
  
            color: rgba(255,255,255,0.88);
  
            margin-bottom: 12px;
          }
  
          .email {
            color: #f0c36a;
  
            font-weight: 600;
          }
  
          @media (max-width: 768px) {
            .content {
              padding: 24px;
  
              border-radius: 20px;
            }
  
            h1 {
              font-size: 28px;
            }
  
            h2 {
              font-size: 18px;
            }
  
            p {
              font-size: 14px;
  
              line-height: 1.7;
            }
          }
        `}</style>
      </div>

    );
  }