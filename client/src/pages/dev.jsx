import Link from "next/link";
import React from "react";

const DevPage = () => {
  const devLinks = [
    { href: "/forgot-password", label: "Forgot password" },
    { href: "/check-email", label: "Check your email" },
    // Account settings is still available by direct URL but not linked here,
    // so new users only see the main profile page.
    { href: "/seller/demo", label: "Seller profile (demo)" },
    { href: "/favorites", label: "Saved gigs / Favorites" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/pricing", label: "Pricing & fees" },
    { href: "/category/logo-design", label: "Category browse (e.g. Logo Design)" },
    { href: "/not-a-page", label: "404 (custom not found)" },
    { href: "/help", label: "Help center" },
    { href: "/contact", label: "Contact support" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Dev pages
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Quick links to new UI-only pages. Only linked in nav when running in
          development.
        </p>
        <ul className="space-y-2">
          {devLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-[#1DBF73] hover:underline font-medium"
              >
                {label}
              </Link>
              <span className="text-gray-400 text-sm ml-2">{href}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DevPage;
