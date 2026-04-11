import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaStar, FaHeart } from "react-icons/fa";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FAVORITES_ROUTE } from "../../utils/constants";

const SearchGridItem = ({ gig, initialFavorite = false }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isToggling, setIsToggling] = useState(false);
  const [cookies] = useCookies();

  const calculateRatings = () => {
    const { reviews } = gig;
    let rating = 0;
    if (!reviews?.length) {
      return 0;
    }
    reviews?.forEach((review) => {
      rating += review.rating;
    });
    return (rating / reviews.length).toFixed(1);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (isToggling) return;
    if (!cookies.jwt) {
      // User not logged in; you could route to login or show a toast instead
      return;
    }
    try {
      setIsToggling(true);
      if (isFavorite) {
        await axios.delete(`${FAVORITES_ROUTE}/${gig.id}`, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
          withCredentials: true,
        });
        setIsFavorite(false);
      } else {
        await axios.post(
          FAVORITES_ROUTE,
          { gigId: gig.id },
          {
            headers: {
              Authorization: `Bearer ${cookies.jwt}`,
            },
            withCredentials: true,
          }
        );
        setIsFavorite(true);
      }
    } catch (err) {
      // Silently ignore for now; could add toast later
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className="flex flex-col gap-3 p-4 cursor-pointer mb-2 bg-card border border-zinc-800 rounded-2xl shadow-lg hover:shadow-[0_8px_30px_rgba(29,191,115,0.12)] hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group"
      onClick={() => router.push(`/gig/${gig.id}`)}
    >
      <div className="relative w-full h-[180px] overflow-hidden rounded-xl bg-zinc-900">
        <Image src={`${gig.images[0]}`} alt="gig" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-zinc-800 transition-colors border border-white/10"
        >
          <FaHeart
            className={
              isFavorite ? "text-red-500 h-4 w-4" : "text-zinc-400 h-4 w-4"
            }
          />
        </button>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div>
          {gig.createdBy.profileImage ? (
            <Image
              src={gig.createdBy.profileImage}
              alt="profile"
              height={32}
              width={32}
              className="rounded-full ring-2 ring-primary/20"
            />
          ) : (
            <div className="bg-primary h-8 w-8 flex items-center justify-center rounded-full relative shadow-[0_0_10px_rgba(29,191,115,0.3)]">
              <span className="text-sm font-semibold text-white">
                {gig.createdBy.email[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className="text-sm text-zinc-300">
          <strong className="font-medium text-white">{gig.createdBy.username}</strong>
        </span>
      </div>
      <div className="min-h-[48px]">
        <p className="line-clamp-2 text-zinc-400 text-sm font-inter group-hover:text-zinc-300 transition-colors">{gig.title}</p>
      </div>
      <div className="flex items-center gap-1.5 text-yellow-500 text-sm mt-auto font-inter">
        <FaStar className="drop-shadow-sm" />
        <span>
          <strong className="font-semibold text-zinc-200">{calculateRatings()}</strong>
        </span>
        <span className="text-zinc-500 ml-1">({gig?.reviews?.length} Reviews)</span>
      </div>
      <div className="border-t border-zinc-800/50 pt-3 mt-2">
        <strong className="font-semibold text-white text-lg font-outfit">From ${gig.price}</strong>
      </div>
    </div>
  );
};

export default SearchGridItem;
