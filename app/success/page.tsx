"use client";

export default function SuccessPage() {

  return (

    <div className="container">

      <div className="card">

        <div className="check">
          ✓
        </div>

        <h1>
          Payment Successful
        </h1>

        <p className="text">
          Your Cryptonix subscription
          has been activated.
        </p>

        <p className="sub">
           If your access is not activated
            within 24 hours,
           please contact support.
        </p>

        <div className="email">
        support@cryptonix.life
        </div>

        <a
          href="/login"
          className="btn"
        >
          Go To Login
        </a>

      </div>

      <style jsx>{`
        .container {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            radial-gradient(
              circle at top,
              rgba(255,140,0,0.12),
              #050505 60%
            );

          padding: 20px;
        }

        .card {
          width: 420px;
          max-width: 100%;

          background:
            rgba(15,15,15,0.92);

          border:
            1px solid rgba(255,170,0,0.14);

          border-radius: 28px;

          padding: 42px 30px;

          text-align: center;

          color: white;

          backdrop-filter: blur(18px);

          box-shadow:
            0 0 40px rgba(255,140,0,0.08);
        }

        .check {
          width: 82px;
          height: 82px;

          margin: 0 auto 22px;

          border-radius: 999px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 42px;
          font-weight: bold;

          color: black;

          background:
            linear-gradient(
              135deg,
              #f5d06a,
              #a26b00
            );
        }

        h1 {
          font-size: 34px;

          margin-bottom: 16px;

          color: #f5d06a;
        }

        .text {
          font-size: 17px;

          line-height: 1.7;

          opacity: 0.92;

          margin-bottom: 14px;
        }

        .sub {
          font-size: 14px;

          opacity: 0.6;

          margin-bottom: 22px;
        }

        .email {
          margin-bottom: 28px;

          color: #ffd36b;

          font-weight: 600;
        }

        .btn {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          width: 100%;

          padding: 14px;

          border-radius: 999px;

          text-decoration: none;

          color: black;

          font-weight: bold;

          background:
            linear-gradient(
              90deg,
              #a26b00,
              #f5d06a
            );

          transition: 0.25s ease;
        }

        .btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 8px 24px rgba(255,180,0,0.18);
        }

        @media (max-width: 768px) {

          .card {
            padding: 34px 22px;
          }

          h1 {
            font-size: 28px;
          }

          .text {
            font-size: 15px;
          }
        }
      `}</style>

    </div>
  );
}