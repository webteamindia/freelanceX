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
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <Link
            href="/search"
            className="text-sm text-[#1DBF73] hover:underline mb-2 inline-block"
          >
            ← All categories
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            {displayName}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse freelance services in this category. Gig listings will
            appear here once connected to the backend.
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          <p className="font-medium text-gray-700 mb-2">
            No gigs in &quot;{displayName}&quot; yet
          </p>
          <p className="text-sm">
            Try searching or explore other categories.
          </p>
          <Link
            href="/search"
            className="inline-block mt-4 text-[#1DBF73] font-medium hover:underline"
          >
            Go to search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
