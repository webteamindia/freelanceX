import { getEnv } from "../utils/get-env.js";

const isProd = process.env.NODE_ENV === "production";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "5001"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGO_URI: isProd ? getEnv("DATABASE_URL") : getEnv("DATABASE_URL", ""),

  JWT_SECRET: isProd
    ? getEnv("JWT_SECRET")
    : getEnv("JWT_SECRET", "dev_jwt_secret_change_me"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "3d"),

  JWT_REFRESH_SECRET: isProd
    ? getEnv("JWT_REFRESH_SECRET", undefined)
    : getEnv("JWT_REFRESH_SECRET", "dev_jwt_refresh_change_me"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),

  CLOUDINARY_CLOUD_NAME: isProd
    ? getEnv("CLOUDINARY_CLOUD_NAME")
    : getEnv("CLOUDINARY_CLOUD_NAME", ""),
  CLOUDINARY_API_KEY: isProd
    ? getEnv("CLOUDINARY_API_KEY")
    : getEnv("CLOUDINARY_API_KEY", ""),
  CLOUDINARY_API_SECRET: isProd
    ? getEnv("CLOUDINARY_API_SECRET")
    : getEnv("CLOUDINARY_API_SECRET", ""),

  FRONTEND_ORIGIN: getEnv(
    "FRONTEND_ORIGIN",
    process.env.PUBLIC_URL?.split(",")[0]?.trim() || "http://localhost:3000"
  ),
});

export const Env = envConfig();
