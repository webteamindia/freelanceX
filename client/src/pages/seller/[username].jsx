import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import { GET_PUBLIC_PROFILE } from "../../utils/constants";
import SearchGridItem from "../../components/search/SearchGridItem";
import { FiMail, FiMapPin, FiCalendar, FiClock } from "react-icons/fi";

const SellerProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${GET_PUBLIC_PROFILE}/${username}`);
        setProfile(data.profile);
      } catch (err) {
        setError(err?.response?.data?.message || "Profile not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center pt-32 text-center px-4">
        <h1 className="text-4xl font-outfit font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 font-inter max-w-md">
          {error || "The seller profile you are looking for does not exist or has been removed."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 px-6 py-2.5 bg-primary/10 text-primary font-semibold rounded-full hover:bg-primary/20 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Map gigs to include createdBy so SearchGridItem doesn't break
  const mappedGigs = profile.gigs?.map((gig) => ({
    ...gig,
    createdBy: {
      username: profile.username,
      profileImage: profile.profileImage,
      email: profile.email || "S", // Fallback for the avatar initial
    },
  })) || [];

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Profile Section */}
        <header className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 shadow-xl rounded-3xl p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400 opacity-80" />
          
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-zinc-800 border-4 border-zinc-900 shadow-[0_0_20px_rgba(29,191,115,0.2)] flex items-center justify-center overflow-hidden shrink-0 relative">
              {profile.profileImage ? (
                <Image src={profile.profileImage} alt={profile.username} fill className="object-cover" />
              ) : (
                <span className="text-white text-4xl font-outfit font-bold">
                  {profile.username ? profile.username[0].toUpperCase() : "S"}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold font-outfit text-white tracking-tight drop-shadow-sm">
                {profile.fullName || profile.username}
              </h1>
              <p className="text-zinc-400 font-inter text-sm flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-xs">
                  @{profile.username}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.location.href = `mailto:${profile.email}`}
              className="px-6 py-2.5 text-sm font-semibold text-zinc-950 bg-primary rounded-full hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(29,191,115,0.4)] transition-all flex items-center gap-2"
            >
              <FiMail /> Contact Me
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-4">
          
          {/* Main Content Area */}
          <section className="lg:col-span-3 space-y-8">
            {/* About Section */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-semibold font-outfit text-white mb-4">
                About The Seller
              </h2>
              <p className="text-zinc-300 font-inter leading-relaxed whitespace-pre-wrap">
                {profile.description ||
                  "This seller is quiet and hasn't written a biography yet, but their work speaks for itself!"}
              </p>
            </div>
            
            {/* Active Gigs Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-outfit text-white">
                Gigs by {profile.username}
              </h2>
              
              {mappedGigs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mappedGigs.map((gig) => (
                    <SearchGridItem key={gig.id} gig={gig} />
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-10 text-center">
                  <p className="text-zinc-400 font-inter">
                    This seller doesn't have any active gigs at the moment.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-sm font-semibold font-outfit text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
                Seller details
              </h3>
              <ul className="text-sm text-zinc-300 font-inter space-y-4">
                <li className="flex items-center gap-3">
                  <FiMapPin className="text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Location</span>
                    <span>Global</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <FiCalendar className="text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Member Since</span>
                    <span>{new Date(profile.createdAt).getFullYear()}</span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <FiClock className="text-zinc-500" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Avg. Response Time</span>
                    <span>1 hour</span>
                  </div>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SellerProfilePage;

