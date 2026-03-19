import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { FORGOT_PASSWORD_ROUTE } from "../utils/constants";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    try {
      setIsSubmitting(true);
      await axios.post(FORGOT_PASSWORD_ROUTE, { email });
      router.push("/check-email");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-gray-500 mb-3">
          Enter the email associated with your account and we&apos;ll send you
          a link to reset your password.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1DBF73] hover:bg-[#17a864] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DBF73] disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

