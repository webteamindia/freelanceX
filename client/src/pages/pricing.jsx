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
            How ffiver charges fees and pays sellers after buyer approval.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">
            For buyers
          </h2>
          <p className="text-sm text-zinc-300">
            You pay the gig price at checkout via PayPal. The seller&apos;s share
            and platform fee are shown before you pay. Your payment is held until
            you approve the work, then the seller is paid automatically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">
            For sellers
          </h2>
          <p className="text-sm text-zinc-300">
            You set your own gig prices. Add your PayPal email in account settings
            so we can send earnings when buyers approve orders. ffiver deducts a
            platform fee (see checkout breakdown; default 10%) and pays the rest
            to your PayPal via PayPal Payouts. Until the buyer approves, funds
            stay held on the platform.
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
