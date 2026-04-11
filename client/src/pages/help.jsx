import React from "react";

const HelpPage = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-white">Help center</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Find quick answers to common questions about using ffiver.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">
            Getting started
          </h2>
          <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
            <li>How to create an account</li>
            <li>How to find and order a gig</li>
            <li>How to become a seller</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">Orders</h2>
          <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
            <li>Tracking your order status</li>
            <li>Communicating with your seller</li>
            <li>Requesting revisions or cancellations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">Payments</h2>
          <ul className="list-disc list-inside text-sm text-zinc-300 space-y-1">
            <li>How payments and refunds work</li>
            <li>Payment methods we support</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;

