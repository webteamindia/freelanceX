const WEAK_JWT_SECRETS = new Set([
  "secert_jwt",
  "secert_jwt_refresh",
  "dev_jwt_secret_change_me",
  "dev_jwt_refresh_change_me",
]);

const isProduction = () => process.env.NODE_ENV === "production";

const requireVar = (key) => {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    throw new Error(
      `[freelanceX] Missing required environment variable: ${key}`
    );
  }
  return value.trim();
};

const rejectWeakSecret = (key, value) => {
  if (WEAK_JWT_SECRETS.has(value) || value.length < 32) {
    throw new Error(
      `[freelanceX] ${key} must be at least 32 characters and not a default placeholder in production`
    );
  }
};

/**
 * Fail fast on startup when running in production with unsafe or missing config.
 */
export const validateProductionEnv = () => {
  if (!isProduction()) {
    return;
  }

  requireVar("DATABASE_URL");
  requireVar("PUBLIC_URL");
  requireVar("JWT_SECRET");
  rejectWeakSecret("JWT_SECRET", process.env.JWT_SECRET.trim());

  if (process.env.JWT_REFRESH_SECRET) {
    rejectWeakSecret("JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET.trim());
  }

  requireVar("CLOUDINARY_CLOUD_NAME");
  requireVar("CLOUDINARY_API_KEY");
  requireVar("CLOUDINARY_API_SECRET");

  requireVar("PAYPAL_CLIENT_ID");
  requireVar("PAYPAL_CLIENT_SECRET");

  if (!process.env.PAYPAL_MODE) {
    console.warn(
      "[freelanceX] PAYPAL_MODE is not set; defaulting to sandbox. Set PAYPAL_MODE=live for production payments."
    );
  }
};

export const getCorsOrigins = () => {
  const raw = process.env.PUBLIC_URL;
  if (!raw) {
    if (isProduction()) {
      throw new Error(
        "[freelanceX] PUBLIC_URL must be set in production (comma-separated frontend URLs)"
      );
    }
    return true;
  }
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
};
