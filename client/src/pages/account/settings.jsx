import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import AdminTwoFactor from "../../components/AdminTwoFactor";
import {
  GET_USER_INFO,
  RESEND_VERIFICATION_ROUTE,
  SET_NOTIFICATION_PREFS,
  SET_PAYPAL_EMAIL,
  SET_USER_INFO,
} from "../../utils/constants";

const inputClassName =
  "w-full px-3 py-2 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500";

const AccountSettingsPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cookies] = useCookies();
  const [isAdmin, setIsAdmin] = useState(false);
  const [totpEnabled, setTotpEnabled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await axios.post(
          GET_USER_INFO,
          {},
          {
            headers: {
              Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "",
            },
            withCredentials: true,
          }
        );
        setFullName(user.fullName || "");
        setUsername(user.username || "");
        setBio(user.description || "");
        setPaypalEmail(user.paypalEmail || "");
        setEmailVerified(user.emailVerified !== false);
        setNotifyOrders(user.notifyOrderEmails !== false);
        setNotifyMessages(user.notifyMessageEmails !== false);
        setIsAdmin(Boolean(user.isAdmin));
        setTotpEnabled(Boolean(user.totpEnabled));
      } catch (err) {
        setError("Could not load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSavePaypalEmail = async () => {
    setError("");
    setSuccess("");
    if (!paypalEmail.trim()) {
      setError("PayPal email is required to receive payouts as a seller.");
      return;
    }
    try {
      setSaving(true);
      await axios.post(
        SET_PAYPAL_EMAIL,
        { paypalEmail: paypalEmail.trim() },
        {
          headers: {
            Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "",
          },
          withCredentials: true,
        }
      );
      setSuccess("PayPal payout email saved. You can now receive payments when buyers approve orders.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save PayPal email. Please check the address and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setError("");
    setSuccess("");
    try {
      setSaving(true);
      await axios.post(
        SET_NOTIFICATION_PREFS,
        {
          notifyOrderEmails: notifyOrders,
          notifyMessageEmails: notifyMessages,
        },
        {
          headers: { Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "" },
        }
      );
      setSuccess("Notification preferences saved.");
    } catch (err) {
      setError("Could not save notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setSaving(true);
      const { data } = await axios.post(
        RESEND_VERIFICATION_ROUTE,
        {},
        { headers: { Authorization: `Bearer ${cookies.jwt}` } }
      );
      setSuccess(data.message || "Verification email sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send verification email.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setError("");
    setSuccess("");
    if (!fullName || !username || !bio) {
      setError("Full name, username and bio are required.");
      return;
    }
    try {
      setSaving(true);
      const { data } = await axios.post(
        SET_USER_INFO,
        {
          userName: username,
          fullName,
          description: bio,
        },
        {
          headers: {
            Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "",
          },
          withCredentials: true,
        }
      );
      if (data?.userNameError) {
        setError("That username is already taken.");
      } else {
        setSuccess("Profile updated successfully.");
      }
    } catch (err) {
      setError("Could not save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8">
          <p className="text-sm text-zinc-400">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-white">
            Account settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your personal information, security, and notification
            preferences.
          </p>
        </header>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600" role="status">
            {success}
          </p>
        )}

        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium text-white">
            Profile information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Full name
              </label>
              <input
                type="text"
                className={inputClassName}
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Username
              </label>
              <input
                type="text"
                className={inputClassName}
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                className={inputClassName}
                placeholder="Tell buyers a bit about yourself."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium text-white">Seller payouts (PayPal)</h2>
          <p className="text-sm text-zinc-400">
            When a buyer approves your work, ffiver sends your earnings to this PayPal
            email. It must match an active PayPal account you own.
          </p>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              PayPal email
            </label>
            <input
              type="email"
              className={inputClassName}
              placeholder="you@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleSavePaypalEmail}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-zinc-700 hover:bg-zinc-600 disabled:opacity-60"
            disabled={saving}
          >
            Save PayPal email
          </button>
        </section>

        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium text-white">Email verification</h2>
          {emailVerified ? (
            <p className="text-sm text-emerald-400">Your email is verified.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-amber-400">
                Please verify your email to place orders (when enforcement is enabled).
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={saving}
                className="text-sm px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                Resend verification email
              </button>
            </div>
          )}
        </section>

        <section className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-medium text-white">Notifications</h2>
          <p className="text-sm text-zinc-400">
            Email alerts when SMTP is configured on the server.
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={notifyOrders}
                onChange={(e) => setNotifyOrders(e.target.checked)}
              />
              <span className="text-sm text-zinc-300">Order & payout updates</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
              />
              <span className="text-sm text-zinc-300">New messages</span>
            </label>
          </div>
          <button
            type="button"
            onClick={handleSaveNotifications}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-zinc-700 hover:bg-zinc-600"
          >
            Save notification preferences
          </button>
        </section>
        {isAdmin ? <AdminTwoFactor jwt={cookies.jwt} enabled={totpEnabled} /> : null}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-[#17a864] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DBF73] disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;

