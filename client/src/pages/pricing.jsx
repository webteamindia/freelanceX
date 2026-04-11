import React from "react";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-white">
            Pricing &amp; fees
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            How ffiver charges fees and when payouts are released to sellers.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">
            For buyers
          </h2>
          <p className="text-sm text-zinc-300">
            You pay the gig price shown at checkout. In most cases, ffiver
            charges a small service fee on top of the gig price, which will be
            clearly displayed before you confirm payment. Funds are held
            securely until you approve the delivery or the order is otherwise
            closed under our policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">
            For sellers
          </h2>
          <p className="text-sm text-zinc-300">
            You set your own gig prices. ffiver charges a service fee on the
            total order amount and pays you the remainder as your net earnings.
            Earnings are usually cleared and available for withdrawal a set
            number of days after the order is marked as completed, to allow time
            for dispute handling and security checks. You can withdraw cleared
            funds to supported payout methods such as bank transfer or PayPal,
            where available.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">
            Refunds &amp; cancellations
          </h2>
          <p className="text-sm text-zinc-300">
            In general, orders may be cancelled and refunded in limited cases,
            such as non-delivery, violation of our Terms, or mutual agreement
            between buyer and seller. If there is a problem with an order, you
            should first try to resolve it through the order chat. If that
            fails, you can contact ffiver support to review the case. We may
            issue partial or full refunds at our discretion, in line with our
            Terms of Service.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PricingPage;
