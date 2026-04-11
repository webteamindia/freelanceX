import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";

const images = [
  "/bg-herof.png",
  "/bg-hero2.png",
  "/bg-hero3.png",
  "/bg-hero5.png",
  "/bg-hero6.png",
];

const popularSearchTerms = [
  { label: "Website Design", query: "website design" },
  { label: "Wordpress", query: "wordpress" },
  { label: "Logo Design", query: "logo design" },
  { label: "AI Services", query: "ai services" },
];

const HeroBanner = () => {
  const router = useRouter();
  const [image, setImage] = useState(0);
  const [searchData, setSearchData] = useState("");

  useEffect(() => {
    const interval = setInterval(
      () => setImage((prev) => (prev >= images.length - 1 ? 0 : prev + 1)),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    if (searchData.trim()) {
      router.push(`/search?q=${searchData}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-[600px] md:min-h-[720px] bg-background relative overflow-hidden flex items-center pt-20 md:pt-0 pb-12 md:pb-0">
      {/* Background Images & Gradient Overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        {images.map((img, index) => (
          <Image
            key={index}
            alt={`Hero background ${index + 1}`}
            src={img}
            fill
            className={`object-cover ${
              index === image ? "opacity-30 md:opacity-70 scale-100" : "opacity-0 scale-105"
            } transition-all duration-1000 ease-in-out`}
            priority={index === 0}
          />
        ))}
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none"></div>
      </div>

      <div className="z-20 relative w-full md:w-3/5 lg:w-1/2 flex justify-center flex-col h-full gap-8 md:gap-10 md:ml-20 mx-6 animate-[float_6s_ease-in-out_infinite]">
        <h1 className="font-outfit text-white font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.1] md:leading-[1.1] tracking-tight mt-10 md:mt-0">
          Find the perfect <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">freelance services</span> <br />
          for your business.
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 mt-2">
          <div className="relative w-full md:w-[500px]">
            <IoSearchOutline className="absolute text-zinc-400 text-2xl flex items-center h-full left-4" />
            <input
              type="text"
              placeholder="Search for any service..."
              className="h-14 md:h-16 w-full pl-14 pr-5 rounded-xl md:rounded-r-none bg-zinc-900/40 backdrop-blur-xl border border-white/10 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-zinc-900/60"
              onChange={(e) => setSearchData(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            className="h-14 md:h-16 w-full md:w-auto bg-primary hover:bg-primary-hover text-white px-10 text-lg font-semibold rounded-xl md:rounded-l-none transition-all duration-300 shadow-[0_4px_14px_rgba(29,191,115,0.2)] hover:shadow-[0_6px_20px_rgba(29,191,115,0.4)]"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>

        <div className="text-zinc-300 flex flex-col md:flex-row items-start md:items-center gap-4 mt-2 font-inter">
          <span className="font-medium text-sm text-zinc-400">Popular:</span>
          <ul className="flex flex-wrap gap-2 md:gap-3">
            {popularSearchTerms.map(({ label, query }) => (
              <li
                key={query}
                className="text-xs md:text-sm py-1.5 px-3 md:px-4 bg-zinc-800/30 hover:bg-zinc-700/60 backdrop-blur-md border border-zinc-700/50 rounded-full text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:border-zinc-500"
                onClick={() => router.push(`/search?q=${query}`)}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
