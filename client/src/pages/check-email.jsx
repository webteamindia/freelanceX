import Link from "next/link";
import React from "react";

const CheckEmailPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-[#1DBF73]/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-6 w-6 text-[#1DBF73]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Check your email
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          We&apos;ve sent you a link to verify your email or reset your
          password. Check your inbox (and spam folder) and click the link to
          continue.
        </p>
        <Link
          href="/"
          className="inline-block text-[#1DBF73] font-medium hover:underline"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default CheckEmailPage;
