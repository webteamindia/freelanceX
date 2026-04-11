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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Forgot your password?
        </h1>
        <p className="text-sm text-zinc-400 mb-3">
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
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-inter"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-outfit font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(29,191,115,0.4)]"
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

