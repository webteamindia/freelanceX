import React from "react";
import Image from "next/image";
import { BsCheckCircle } from "react-icons/bs";

const Business = () => {
  const features = [
    "Talent matching",
    "Dedicated account management",
    "Team collaboration tools",
    "Business payment solutions",
  ];

  return (
    <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-background border-y border-zinc-800/50 px-6 md:px-32 py-16 md:py-24 flex flex-col md:flex-row gap-12 md:gap-20 items-center">
      <div className="text-white flex flex-col gap-8 justify-center items-start md:w-1/2">
        <div className="flex gap-2 text-white text-3xl md:text-4xl font-bold items-center font-outfit">
          <span>
            <i className="font-medium text-zinc-300">freelance</i>
            <b className="text-primary text-5xl ml-1">X</b>
          </span>
          <span className="tracking-tight">Business</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-outfit font-bold leading-[1.2]">
          A solution built for <span className="text-gradient">business</span>
        </h2>
        <ul className="flex flex-col gap-5 mt-2">
          {features.map((feature) => (
            <li key={feature} className="flex gap-4 items-center">
              <BsCheckCircle className="text-primary text-2xl drop-shadow-[0_0_8px_rgba(29,191,115,0.4)]" />
              <span className="text-zinc-300 font-inter text-lg">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          className="mt-4 border-2 font-semibold px-8 py-4 rounded-xl transition-all duration-300 border-primary bg-primary text-white hover:bg-transparent hover:text-primary hover:shadow-[0_0_20px_rgba(29,191,115,0.3)]"
          type="button"
        >
          Explore XBusiness
        </button>
      </div>
      <div className="relative w-full h-[320px] md:h-[512px] md:w-1/2 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-zinc-800">
        <Image src="/business.png" alt="business" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Business;
