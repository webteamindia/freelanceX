import React from "react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Last updated: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">1. Overview</h2>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of the ffiver
            platform and services (collectively, the &quot;Platform&quot;). By creating
            an account or using ffiver as a buyer or seller, you agree to be
            bound by these Terms.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            2. Accounts &amp; eligibility
          </h2>
          <p>
            You must be at least 18 years old, or the age of legal majority in
            your jurisdiction, to use ffiver. You are responsible for
            maintaining the confidentiality of your login details and for all
            activity that occurs under your account.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            3. Use of the Platform
          </h2>
          <p>
            You agree to use ffiver only for lawful purposes and in accordance
            with these Terms and any additional policies we may publish. You may
            not post or deliver content that is illegal, abusive, misleading,
            infringes intellectual property rights, or otherwise violates
            another person&apos;s rights.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            4. Buyer and seller relationships
          </h2>
          <p>
            Buyers and sellers enter into a direct contractual relationship with
            each other for each order. ffiver is not a party to that contract
            and does not guarantee any specific outcome, delivery quality, or
            success of a project.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">5. Payments</h2>
          <p>
            Buyers pay via PayPal at checkout. ffiver captures the payment to
            the platform account and holds the seller&apos;s portion until the
            buyer approves delivery in their orders. When approved, ffiver sends
            the seller&apos;s earnings (minus our platform fee) to the PayPal
            email on the seller&apos;s account. Refunds and disputes are handled
            per our policies and PayPal&apos;s terms.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            6. Cancellations, refunds &amp; disputes
          </h2>
          <p>
            In certain cases, an order may be cancelled and refunded according
            to our refund and cancellation rules. Buyers and sellers should
            first try to resolve issues through the order chat. If you cannot
            reach a resolution, you can contact ffiver support for help
            mediating the issue. We reserve the right to issue partial or full
            refunds at our discretion.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            7. Intellectual property
          </h2>
          <p>
            Unless otherwise agreed in writing between the buyer and seller,
            rights to delivered work are transferred to the buyer upon full
            payment and order completion. ffiver does not claim ownership of the
            content you create, but you grant us a limited license to host,
            display, and use it to operate the Platform.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            8. Termination &amp; account suspension
          </h2>
          <p>
            We may suspend or terminate your account if we reasonably believe
            you have violated these Terms, engaged in fraud or abuse, or created
            a risk of harm or legal exposure for ffiver or other users.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            9. Limitation of liability
          </h2>
          <p>
            To the maximum extent permitted by law, ffiver and its owners,
            affiliates, and team will not be liable for lost profits, revenues,
            data, or indirect, special, consequential, exemplary, or punitive
            damages arising out of or related to your use of the Platform.
          </p>
        </section>

        <section className="space-y-2 text-sm text-zinc-300">
          <h2 className="text-lg font-medium text-white">
            10. Changes to these Terms
          </h2>
          <p>
            We may update these Terms from time to time. If we make material
            changes, we will notify you by updating the &quot;Last updated&quot; date
            and, where appropriate, by email or an in-app notice. Your continued
            use of ffiver after changes become effective constitutes acceptance
            of the new Terms.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;

