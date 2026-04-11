import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold text-white mt-2">
          Page not found
        </h2>
        <p className="text-zinc-400 mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 text-white bg-primary rounded-md font-medium hover:bg-[#17a864] transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
