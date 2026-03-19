import React from "react";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date().getFullYear()}
          </p>
        </header>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            1. Who we are
          </h2>
          <p>
            ffiver is an online marketplace that connects buyers and freelancers
            for digital services. This Privacy Policy explains how we collect,
            use, and protect your information when you use the Platform.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            2. Information we collect
          </h2>
          <p>
            We collect information that you provide directly, such as your name,
            email address, profile details, gig descriptions, messages, and
            payment-related information (processed by our payment partners). We
            also collect certain technical data automatically, like IP address,
            device information, and usage data (pages visited, actions taken)
            through cookies and similar technologies.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            3. How we use your information
          </h2>
          <p>
            We use your information to operate and improve ffiver, including to:
            create and manage your account, match buyers and sellers, process
            payments, provide customer support, send important updates about
            your account or orders, and protect the Platform from fraud and
            abuse.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            4. Sharing of information
          </h2>
          <p>
            We share certain information with other users as needed to complete
            orders (for example, your username, profile details, and messages).
            We may share information with trusted service providers who help us
            operate ffiver (such as hosting, analytics, and payment processing),
            under contracts that require them to protect your data. We may also
            share information if required by law or to protect our rights or the
            safety of others.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            5. Cookies &amp; tracking
          </h2>
          <p>
            ffiver uses cookies and similar technologies to remember your
            preferences, keep you signed in, and understand how the Platform is
            used so we can improve it. You can control cookies through your
            browser settings, but disabling them may affect some features.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            6. Data retention
          </h2>
          <p>
            We keep your information for as long as your account is active or as
            needed to provide the services, comply with legal obligations,
            resolve disputes, and enforce our agreements. If you close your
            account, we may retain limited information where required by law or
            for legitimate business purposes.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            7. Your rights
          </h2>
          <p>
            Depending on your location, you may have rights to access, correct,
            or delete certain personal information we hold about you, or to
            object to or restrict certain processing. To exercise these rights,
            please contact us using the details below.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700">
          <h2 className="text-lg font-medium text-gray-900">
            8. How to contact us
          </h2>
          <p>
            If you have questions about this Privacy Policy or how we handle
            your data, please contact our support team via the Contact page in
            the app.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;

