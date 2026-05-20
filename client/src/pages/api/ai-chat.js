const MODEL = "deepseek/deepseek-v4-flash";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.AGENT_API;
  if (!apiKey) {
    return res.status(500).json({
      error: "Missing AGENT_API environment variable.",
    });
  }

  const { messages = [], context = "" } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Message history is required." });
  }

  try {
    const referer =
      req.headers.origin ||
      (req.headers.referer ? req.headers.referer.split("/").slice(0, 3).join("/") : "") ||
      "http://localhost:3000";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "ffiver",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are ffiver Assistant, a helpful platform support and marketplace guide. Keep answers concise, friendly, and action-oriented. Help with gigs, messaging, orders, payments, account issues, and seller or buyer workflows. If a question is outside the platform, say so briefly and redirect to a relevant ffiver action when possible.",
          },
          {
            role: "system",
            content: `Current page context: ${context}`,
          },
          ...messages,
        ],
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter request failed.",
      });
    }

    const message = data?.choices?.[0]?.message?.content?.trim();

    if (!message) {
      return res.status(502).json({
        error: "OpenRouter returned an empty response.",
      });
    }

    return res.status(200).json({ message });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Unexpected error while contacting OpenRouter.",
    });
  }
}
