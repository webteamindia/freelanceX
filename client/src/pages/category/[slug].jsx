import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MagnifyingGlass } from "react-loader-spinner";
import SearchGridItem from "../../components/search/SearchGridItem";
import { categories } from "../../utils/categories";
import { SEARCH_GIGS_ROUTE } from "../../utils/constants";

function slugifyCategory(name) {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const CategoryPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = useMemo(() => {
    if (!slug || typeof slug !== "string") return "";
    const matched = categories.find((c) => slugifyCategory(c.name) === slug);
    if (matched) return matched.name;
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [slug]);

  useEffect(() => {
    if (!categoryName) return;

    const fetchGigs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ category: categoryName });
        const { data } = await axios.get(
          `${SEARCH_GIGS_ROUTE}?${params.toString()}`
        );
        setGigs(data.gigs || []);
      } catch (err) {
        console.log(err);
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, [categoryName]);

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
            {categoryName || "Category"}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Browse freelance services in this category.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <MagnifyingGlass
              visible={true}
              height="80"
              width="80"
              ariaLabel="MagnifyingGlass-loading"
              glassColor="#1DBF73"
              color="#18181b"
            />
          </div>
        ) : gigs.length > 0 ? (
          <>
            <p className="text-zinc-500 text-sm mb-6 font-inter">
              {gigs.length} services available
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <SearchGridItem gig={gig} key={gig.id} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg p-8 text-center text-zinc-400">
            <p className="font-medium text-zinc-300 mb-2">
              No gigs in &quot;{categoryName}&quot; yet
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
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
