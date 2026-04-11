import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FAVORITES_ROUTE } from "../utils/constants";
import SearchGridItem from "../components/search/SearchGridItem";

const FavoritesPage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cookies] = useCookies();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(FAVORITES_ROUTE, {
          headers: {
            Authorization: cookies.jwt ? `Bearer ${cookies.jwt}` : "",
          },
          withCredentials: true,
        });
        setGigs(data?.gigs || []);
      } catch (err) {
        setError("Could not load favorites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);
  return (
    <div className="min-h-screen pt-10 px-6 md:px-0 pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-outfit font-bold text-white tracking-tight">
            Saved <span className="text-primary">gigs</span>
          </h1>
          <p className="text-base text-zinc-400 font-inter mt-2">
            Keep track of gigs you love and come back to them anytime.
          </p>
        </header>

        {loading ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 shadow-lg backdrop-blur-sm">
            <p className="text-base font-inter">Loading your favorites...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-12 text-center text-red-500 shadow-lg">
            <p className="text-base font-inter font-medium">{error}</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-16 text-center shadow-lg backdrop-blur-sm flex flex-col items-center justify-center">
            <p className="mb-4 text-xl font-medium text-white font-outfit">
              You haven&apos;t saved any gigs yet.
            </p>
            <p className="text-base text-zinc-400 font-inter max-w-md">
              Browse freelance services and click the heart icon on any gig to
              save it here for later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gigs.map((gig) => (
              <SearchGridItem key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

