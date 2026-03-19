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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Set a new password
        </h1>
        <p className="text-sm text-gray-500 mb-3">
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#1DBF73] hover:bg-[#17a864] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DBF73] disabled:opacity-60"
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

