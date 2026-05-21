"use client";

import { useState } from "react";

export default function TermsPage() {

  const [agreed, setAgreed] = useState(false);

    return (
      <div className="termsPage">
        <div className="overlay" />
  
        <div className="content">


          <a href="/" className="backBtn">
          ← Back to Cryptonix.life
</a>
  
          <p className="updated">
          Last Updated: May 15, 2026
          </p>
  
          <section>
            <h2>Terms of Service</h2>
            <p>{`
By accessing or using Cryptonix.life (“Service”), you acknowledge and agree to be legally bound by these Terms of Service, Privacy Policy, Disclaimer, and all applicable laws and regulations.
Cryptonix.life provides educational and informational digital content related to cryptocurrency markets, analytics, AI-assisted research, and market commentary.
All content available through the Service is provided strictly for informational and educational purposes only.
Cryptonix.life DOES NOT provide:
• financial or investment advice;• legal or tax advice;• brokerage or exchange services;• portfolio or asset management services;• guarantees of profits, earnings, or financial performance.
Users are solely responsible for their own decisions, actions, investments, and use of any information provided through the Service.
Access to subscription-based content may be granted within up to 24 hours after successful payment confirmation.
Cryptonix.life reserves the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
By continuing to use the Service, the User confirms full acceptance of these Terms.

ABOUT CRYPTONIX.LIFE

CRYPTONIX.LIFE is a digital subscription-based platform that provides users with access to AI-powered tools, analytical dashboards, and educational digital content.

The platform is designed to help users explore and interact with modern digital technologies, automation systems, and data-driven insights in an accessible online format.

All content provided on this website is for informational and educational purposes only.
CRYPTONIX.LIFE does not provide financial, investment, or legal advice, and no guarantees of results are made or implied.

WHAT USERS GET

By subscribing to CRYPTONIX.LIFE, users receive access to the following digital features:

* Access to a secure user dashboard;
* AI-powered analytical tools and insights;
* Market data analysis and informational reports;
* Educational digital content and resources;
* Regular updates and improvements to platform features.

All features are provided in a fully digital format and become available after successful payment and account activation.

PRIVACY POLICY
Cryptonix.life respects and values user privacy and is committed to protecting personal information in accordance with applicable international privacy standards.
The Service may collect limited personal information including:
• email address;• billing information;• technical and device-related information;• website usage analytics.
Personal information is used solely for:
• providing access to the Service;• payment processing;• customer support;• account-related communication;• improving platform functionality and security.
Cryptonix.life does NOT sell, rent, or trade personal information to third parties.
Payment transactions are securely processed through third-party payment providers, including Stripe. Cryptonix.life does not directly store full payment card information.
Reasonable technical and organizational security measures are implemented to protect user data from unauthorized access, misuse, disclosure, or loss.
By using the Service, Users consent to the collection and use of information as described in this Privacy Policy.

DISCLAIMER

The information and services provided on Cryptonix.life are intended solely for general informational and educational purposes.

While we make reasonable efforts to ensure that the content is accurate and up to date, we do not provide any warranties or guarantees regarding the accuracy, completeness, reliability, or suitability of the information available on the platform.

CRYPTONIX.LIFE does not provide financial, investment, legal, tax, or professional advice. Nothing on this website should be interpreted as a recommendation or instruction to take any specific action. Users are solely responsible for how they choose to interpret and use the information provided.

All services and content are provided on an “as is” and “as available” basis, without any express or implied warranties of any kind.

To the maximum extent permitted by applicable law, Cryptonix.life shall not be held liable for any direct, indirect, incidental, special, consequential, or punitive damages, including, without limitation, loss of data, loss of profits, loss of revenue, or business interruption, resulting from or in any way related to the use of, or inability to use, the platform or its services.

CONTACT INFORMATION

Website: https://cryptonix.life
Support email: support@cryptonix.life

Response time: up to 48 hours

For any questions, support requests, or billing inquiries, you may contact our support team via email.

We aim to respond to all requests within 48 hours .

   NO GUARANTEED PROFITS

IMPORTANT RISK DISCLOSURE

Cryptocurrency trading and investing involve substantial financial risk and may result in partial or total loss of capital.

By using CRYPTONIX.LIFE, you acknowledge and agree that:

* There are NO guaranteed profits;
* Past performance does NOT guarantee future results;
* Trading signals, forecasts, and analytics may fail or be inaccurate;
* You may lose part or ALL of your invested funds;
* All investment and trading decisions are made solely at your own risk and discretion.

The Service, its owners, employees, affiliates, analysts, contributors, partners, or representatives shall NOT be liable for:

* Trading losses;
* Financial damages;
* Missed profits;
* Investment outcomes;
* User financial decisions.

SUBSCRIPTION TERMS

By purchasing a subscription on CRYPTONIX.LIFE, you agree to the following terms:

⸻

Subscription Access

* The duration of access is specified in the selected pricing plan at the time of purchase;
* Subscription access is delivered in a fully digital format;
* Access credentials are sent to the email address provided during checkout;
* Access is typically delivered within up to 24 hours after successful payment confirmation;
* The Service is considered fully delivered once access credentials have been successfully issued and sent to the user’s email.

⸻

Payments

* Payments are processed as one-time charges, unless explicitly stated otherwise prior to purchase;
* Automatic renewal is not enabled, unless clearly disclosed and agreed to before checkout;
* Prices, subscription plans, features, and Service functionality may be updated, modified, or discontinued at any time without prior notice.

⸻

REFUND POLICY

Due to the digital nature of the services provided by CRYPTONIX.LIFE:

* All payments are considered final once access has been delivered;
* No refunds are issued after subscription access or digital content has been provided;
* By completing a purchase, the user acknowledges and agrees that the service is deemed fully delivered upon successful issuance of access credentials;
* Users are responsible for reviewing all subscription details and conditions before completing payment.

Refunds may only be considered in strictly limited cases, including:

* duplicate payment resulting from a verified technical error;
* failure to deliver access within the stated 24-hour timeframe;
* confirmed technical malfunction on the provider’s side preventing access to the service.

All refund requests are subject to individual review.

⸻

FRAUD, DISPUTES & ABUSE

Any activity involving:

* fraudulent or abusive chargebacks;
* unauthorized or unjustified payment disputes;
* payment reversals without valid grounds;
* misuse or exploitation of the refund policy;

may result in:

* immediate suspension or permanent termination of access;
* restriction from future use of the Service;
* reporting to payment processors and/or relevant financial institutions where legally required.
            `}</p>
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
  
            padding: 25px 20px;
          }
  
.backBtn {
  display: inline-block;

  margin-bottom: 15px;

  color:rgb(144, 247, 19);

  text-decoration: none;

  font-size: 33px;

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
  
            backdrop-filter: blur(20px);
  
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
  line-height: 1.9;

  font-size: 15px;

  letter-spacing: 0.2px;

  color: rgba(255,255,255,0.88);

  margin-bottom: 18px;

white-space: pre-wrap;
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