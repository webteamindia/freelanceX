import React from "react";
import { categories } from "../../utils/categories";
import Image from "next/image";
import router from "next/router";

const Services = () => {
  return (
    <div className="px-6 md:px-24 py-16 md:py-24">
      <h2 className="text-3xl md:text-5xl font-outfit mb-10 md:mb-14 text-white font-bold tracking-tight">
        You need it, <span className="text-gradient">we've got it</span>
      </h2>
      <ul className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {categories.map(({ name, logo }) => (
          <li
            key={name}
            className="flex flex-col justify-center items-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-sm border border-zinc-800 hover:border-primary p-8 transition-all duration-300 rounded-[1.5rem] hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(29,191,115,0.15)] group"
            onClick={() =>
              router.push(`/search?category=${name.toLowerCase()}`)
            }
          >
            <div className="relative h-16 w-16 mb-4 group-hover:scale-110 transition-transform duration-300">
              <Image src={logo} alt="category" fill className="object-contain filter invert opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(29,191,115,0.8)]" />
            </div>
            <span className="text-zinc-300 font-medium text-center font-inter group-hover:text-white transition-colors">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Services;
