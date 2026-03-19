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
      className="max-w-[300px] flex flex-col gap-2 p-1 cursor-pointer mb-8"
      onClick={() => router.push(`/gig/${gig.id}`)}
    >
      <div className="relative w-64 h-40">
        <Image src={`${gig.images[0]}`} alt="gig" fill className="rounded-xl" />
        <button
          type="button"
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 shadow"
        >
          <FaHeart
            className={
              isFavorite ? "text-red-500 h-4 w-4" : "text-gray-400 h-4 w-4"
            }
          />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div>
          {gig.createdBy.profileImage ? (
            <Image
              src={gig.createdBy.profileImage}
              alt="profile"
              height={30}
              width={30}
              className="rounded-full"
            />
          ) : (
            <div className="bg-purple-500 h-7 w-7 flex items-center justify-center rounded-full relative">
              <span className="text-lg text-white">
                {gig.createdBy.email[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <span className="text-md ">
          <strong className="font-medium">{gig.createdBy.username}</strong>
        </span>
      </div>
      <div>
        <p className="line-clamp-2 text-[#404145]">{gig.title}</p>
      </div>
      <div className="flex items-center gap-1 text-yellow-400">
        <FaStar />
        <span>
          <strong className="font-medium">{calculateRatings()}</strong>
        </span>
        <span className="text-[#74767e]">({gig?.reviews?.length} Reviews)</span>
      </div>
      <div>
        <strong className="font-medium">From ${gig.price}</strong>
      </div>
    </div>
  );
};

export default SearchGridItem;
