import React, { useState } from "react";
import axios from "axios";
import { SUPPORT_CONTACT_ROUTE } from "../utils/constants";

const ContactPage = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !subject || !message) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(SUPPORT_CONTACT_ROUTE, { email, subject, message });
      setSuccess("Your message has been sent. We will get back to you soon.");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900">
            Contact support
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Have a question or need help? Send us a message and we&apos;ll get
            back to you as soon as we can.
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Describe your question or issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#1DBF73] hover:bg-[#17a864] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DBF73] disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;

