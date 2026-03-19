import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { GET_USER_INFO, SET_USER_INFO } from "../../utils/constants";

const inputClassName =
  "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500";

const AccountSettingsPage = () => {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cookies] = useCookies();

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
      } catch (err) {
        setError("Could not load your profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <p className="text-sm text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Account settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
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
          <h2 className="text-lg font-medium text-gray-900">
            Profile information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <h2 className="text-lg font-medium text-gray-900">
            Notifications
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" />
              <span className="text-sm text-gray-700">
                Email me about new messages
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" />
              <span className="text-sm text-gray-700">
                Email me about order updates
              </span>
            </label>
          </div>
        </section>
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-[#1DBF73] hover:bg-[#17a864] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DBF73] disabled:opacity-60"
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

