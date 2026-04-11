import Image from "next/image";
import React from "react";

function Companies() {
  const trustedCompanies = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center justify-center text-zinc-500 text-2xl font-outfit font-semibold min-h-[11vh] mx-2 border-t border-zinc-800/50 mt-10 p-6">
      <p className="hidden md:inline text-xl tracking-wide mr-8">Trusted By :</p>
      <ul className="flex max-w-full justify-between gap-10 md:gap-16 mx-6 transition-all duration-300">
        {trustedCompanies.map((num) => (
          <li key={num} className="relative h-[3.5rem] w-[3.5rem] md:h-[4.5rem] md:w-[4.5rem] filter grayscale hover:grayscale-0 transition-all duration-500 opacity-50 hover:opacity-100 cursor-pointer">
            <Image src={`/trusted${num}.png`} alt="trusted brands" fill className="object-contain" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Companies;
