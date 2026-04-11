import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const CategoryPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const displayName = slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Category";

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <Link
            href="/search"
            className="text-sm text-primary hover:underline mb-2 inline-block"
          >
            ← All categories
          </Link>
          <h1 className="text-2xl font-semibold text-white">
            {displayName}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse freelance services in this category. Gig listings will
            appear here once connected to the backend.
          </p>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg p-8 text-center text-zinc-400">
          <p className="font-medium text-zinc-300 mb-2">
            No gigs in &quot;{displayName}&quot; yet
          </p>
          <p className="text-sm">
            Try searching or explore other categories.
          </p>
          <Link
            href="/search"
            className="inline-block mt-4 text-primary font-medium hover:underline"
          >
            Go to search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
