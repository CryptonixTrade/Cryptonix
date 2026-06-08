export const USDT_WALLET = "TWo1iyUNwYFh63qRuN7grd4eJmu4LDes3p";
export const USDT_NETWORK = "TRC20";

export const PAYMENT_PLANS = [
  {
    id: "monthly",
    title: "Monthly",
    displayPrice: "$5 / month",
    paymentTitle: "Monthly Plan",
    amount: "5",
  },
  {
    id: "quarterly",
    title: "3 Months",
    displayPrice: "$10",
    paymentTitle: "3 Months Plan",
    amount: "10",
  },
  {
    id: "yearly",
    title: "Yearly",
    displayPrice: "$20",
    paymentTitle: "Yearly Plan",
    amount: "20",
  },
] as const;

export type PaymentPlan = (typeof PAYMENT_PLANS)[number];

export function isKnownPaymentRequest(plan: unknown, amount: unknown) {
  return PAYMENT_PLANS.some(
    (item) => item.paymentTitle === plan && item.amount === amount
  );
}
