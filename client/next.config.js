/** @type {import('next').NextConfig} */

if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SERVER_URL?.trim()
) {
  throw new Error(
    "NEXT_PUBLIC_SERVER_URL must be set for production builds (your public API URL, no trailing slash)."
  );
}

function buildApiImagePattern() {
  if (process.env.NODE_ENV !== "production") {
    return {
      protocol: "http",
      hostname: "localhost",
      port: "5001",
      pathname: "**",
    };
  }

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  if (serverUrl) {
    try {
      const u = new URL(serverUrl);
      return {
        protocol: u.protocol.replace(":", ""),
        hostname: u.hostname,
        port: u.port || "",
        pathname: "**",
      };
    } catch {
      // fall through to legacy default
    }
  }

  return {
    protocol: "https",
    hostname: "freelancex.onrender.com",
    pathname: "**",
  };
}

const nextConfig = {
  reactStrictMode: process.env.NODE_ENV === "production",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "**",
      },
      buildApiImagePattern(),
    ],
  },
};

module.exports = nextConfig;
