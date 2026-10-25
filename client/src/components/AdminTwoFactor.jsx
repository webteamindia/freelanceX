import React, { useState } from "react";
import axios from "axios";
import {
  DISABLE_2FA_ROUTE,
  ENABLE_2FA_ROUTE,
  SETUP_2FA_ROUTE,
} from "../utils/constants";

export default function AdminTwoFactor({ jwt, enabled }) {
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [code, setCode] = useState("");
  const [on, setOn] = useState(Boolean(enabled));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const headers = { Authorization: jwt ? `Bearer ${jwt}` : "" };

  const start = async () => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { data } = await axios.post(SETUP_2FA_ROUTE, {}, { headers, withCredentials: true });
      setSecret(data.secret || "");
      setOtpauth(data.otpauth || "");
      setOn(false);
      setMessage(data.message || "Add the key to your authenticator app.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not start authenticator setup.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (turnOn) => {
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { data } = await axios.post(
        turnOn ? ENABLE_2FA_ROUTE : DISABLE_2FA_ROUTE,
        { totpCode: code },
        { headers, withCredentials: true }
      );
      setOn(Boolean(data.totpEnabled));
      setSecret("");
      setOtpauth("");
      setCode("");
      setMessage(data.message || "Saved.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update authenticator.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3 border-t border-zinc-800 pt-6">
      <h2 className="text-lg font-medium text-white">Admin authenticator</h2>
      <p className="text-sm text-zinc-400">
        Admin sign-in asks for a 6-digit code after this is turned on.
        {on ? " It is currently on." : " It is currently off."}
      </p>
      {secret ? (
        <div className="rounded-md border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-200">
          <p className="font-mono break-all">{secret}</p>
          {otpauth ? (
            <p className="mt-2 break-all text-xs text-zinc-500">{otpauth}</p>
          ) : null}
        </div>
      ) : null}
      <input
        type="text"
        inputMode="numeric"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full max-w-xs rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-white"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={start}
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white"
        >
          {secret ? "Generate a new key" : "Set up authenticator"}
        </button>
        <button
          type="button"
          disabled={busy || !secret}
          onClick={() => confirm(true)}
          className="rounded-md bg-green-600 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Turn on
        </button>
        <button
          type="button"
          disabled={busy || !on}
          onClick={() => confirm(false)}
          className="rounded-md border border-zinc-600 px-3 py-2 text-sm text-zinc-200 disabled:opacity-50"
        >
          Turn off
        </button>
      </div>
      {message ? <p className="text-sm text-green-400">{message}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </section>
  );
}
