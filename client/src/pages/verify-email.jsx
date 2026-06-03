import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { VERIFY_EMAIL_ROUTE } from "../utils/constants";

const VerifyEmailPage = () => {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!router.isReady || !token) return;

    const verify = async () => {
      try {
        const { data } = await axios.get(VERIFY_EMAIL_ROUTE, {
          params: { token },
        });
        setStatus("success");
        setMessage(data.message || "Email verified.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification failed. The link may be expired."
        );
      }
    };

    verify();
  }, [router.isReady, token]);

  return (
    <div className="min-h-screen bg-background px-4 py-16 flex items-center justify-center">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-white">Email verification</h1>
        {status === "loading" && (
          <p className="text-zinc-400 text-sm">Verifying your email…</p>
        )}
        {status !== "loading" && (
          <p
            className={`text-sm ${
              status === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
        <Link
          href="/login"
          className="inline-block text-primary font-medium hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
