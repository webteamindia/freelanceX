import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { RESET_PASSWORD_ROUTE } from "../utils/constants";

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link is missing or invalid.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(RESET_PASSWORD_ROUTE, {
        token,
        password,
      });
      setSuccess(data?.message || "Password updated successfully.");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "This reset link is invalid or has expired.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Set a new password
        </h1>
        <p className="text-sm text-zinc-400 mb-3">
          Enter and confirm your new password for your ffiver account.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 mb-3" role="status">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-inter"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-inter"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-lg font-outfit font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(29,191,115,0.4)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

