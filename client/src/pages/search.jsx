import { SEARCH_GIGS_ROUTE } from "../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import SearchGridItem from "../components/search/SearchGridItem";
import { MagnifyingGlass } from "react-loader-spinner";
import AdsenseAd from "../components/AdsenseAd";

const search = () => {
  const router = useRouter();
  const { category, q } = router.query;
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const params = new URLSearchParams();
        if (q && q !== "undefined") params.append("searchTerm", q);
        if (category && category !== "undefined")
          params.append("category", category);
        if (params.toString()) {
          const { data } = await axios.get(
            `${SEARCH_GIGS_ROUTE}?${params.toString()}`
          );
          setGigs(data.gigs);
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    if (category || q) {
      getData();
    } else {
      setLoading(false);
    }
  }, [category, q]);

  if (loading)
    return (
      <div className="flex items-center justify-center text-5xl min-h-[76vh]">
        <MagnifyingGlass
          visible={true}
          height="80"
          width="80"
          ariaLabel="MagnifyingGlass-loading"
          wrapperStyle={{}}
          wrapperClass="MagnifyingGlass-wrapper"
          glassColor="#1DBF73"
          color="#18181b"
        />
      </div>
    );

  return (
    <div className="mx-6 md:mx-24 mb-24 mt-10">
      {!q && !category && (
        <div className="my-10 text-zinc-400 font-inter text-lg">
          Enter a keyword in the search bar or pick a category to see services.
        </div>
      )}
      {q && (
        <h3 className="text-3xl md:text-4xl mb-10 font-outfit font-bold text-white tracking-tight">
          Results for <b className="text-primary font-bold">{q}</b>
        </h3>
      )}
      {category && (
        <h3 className="text-3xl md:text-4xl mb-10 font-outfit font-bold text-white tracking-tight">
          Results for <b className="text-primary font-bold">{category}</b>
        </h3>
      )}
      <div className="flex flex-wrap gap-4 mb-8">
        <button className="py-2.5 px-6 border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-primary/50 transition-colors rounded-xl font-medium text-zinc-300 text-sm shadow-sm backdrop-blur-sm">
          Category
        </button>
        <button className="py-2.5 px-6 border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-primary/50 transition-colors rounded-xl font-medium text-zinc-300 text-sm shadow-sm backdrop-blur-sm">
          Budget
        </button>
        <button className="py-2.5 px-6 border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-primary/50 transition-colors rounded-xl font-medium text-zinc-300 text-sm shadow-sm backdrop-blur-sm">
          Delivery Time
        </button>
      </div>
      <div>
        <div className="my-6">
          <span className="text-zinc-500 font-medium font-inter">
            {gigs.length} services available
          </span>
        </div>
        <AdsenseAd
          slot={process.env.NEXT_PUBLIC_ADSENSE_SEARCH_SLOT}
          className="mb-8"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {gigs.map((gig) => (
            <SearchGridItem gig={gig} key={gig.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default search;
