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
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Saved gigs
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Keep track of gigs you love and come back to them anytime.
          </p>
        </header>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            <p className="text-sm">Loading your favorites...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-red-600">
            <p className="text-sm">{error}</p>
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            <p className="mb-2 font-medium text-gray-700">
              You haven&apos;t saved any gigs yet.
            </p>
            <p className="text-sm">
              Browse freelance services and click the heart icon on any gig to
              save it here for later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

