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
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] rounded-2xl p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-white">
            Contact support
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
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
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-inter"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-inter"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Message
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-inter"
              placeholder="Describe your question or issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex justify-center px-4 py-3 text-lg font-outfit font-semibold rounded-xl text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(29,191,115,0.4)]"
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

