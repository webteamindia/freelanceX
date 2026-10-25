import AppError from "./AppError.js";

function reportToSentry(err) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace(/\//g, "");
    const storeUrl = `${url.protocol}//${url.host}/api/${projectId}/store/?sentry_version=7&sentry_key=${encodeURIComponent(url.username)}`;
    const payload = {
      message: err?.message || "Unhandled error",
      level: "error",
      platform: "node",
      extra: { stack: err?.stack || "" },
    };
    fetch(storeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // Invalid DSN should not affect the API response.
  }
}

const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  reportToSentry(err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    err instanceof AppError ? err.message : "Internal Server Error";

  const response = {
    status: "error",
    message,
  };

  // Include additional details if available
  if (err instanceof AppError && err.details) {
    response.details = err.details; // Include detailed error info if it's an AppError
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
