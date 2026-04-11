import Link from "next/link";
import React from "react";

const HowItWorksPage = () => {
  const buyerSteps = [
    "Search for the service you need or browse by category.",
    "Compare gigs, reviews, and prices. Pick a seller and place an order.",
    "Pay securely. Funds are held until you approve the delivery.",
    "Communicate with your seller and receive your delivery.",
    "Approve the work and release payment when you're happy.",
  ];

  const sellerSteps = [
    "Create a gig: title, description, pricing, and delivery time.",
    "Get discovered by buyers searching for your skills.",
    "Receive orders and communicate with buyers in the order thread.",
    "Deliver your work and request revisions if needed.",
    "Get paid when the buyer approves. Withdraw to your bank or PayPal.",
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-3xl font-semibold text-white">
            How ffiver works
          </h1>
          <p className="text-zinc-400 mt-2">
            Whether you&apos;re buying or selling, here&apos;s the flow.
          </p>
        </header>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            For buyers
          </h2>
          <ol className="space-y-3 list-decimal list-inside text-zinc-300">
            {buyerSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Link
            href="/search"
            className="inline-block mt-4 text-primary font-medium hover:underline"
          >
            Browse services →
          </Link>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            For sellers
          </h2>
          <ol className="space-y-3 list-decimal list-inside text-zinc-300">
            {sellerSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <Link
            href="/seller/gigs/create"
            className="inline-block mt-4 text-primary font-medium hover:underline"
          >
            Create your first gig →
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HowItWorksPage;
