import Image from "next/image";
import React from "react";
import { BsCheckCircle } from "react-icons/bs";

const Everything = () => {
  const everythingData = [
    {
      title: "Stick to your budget",
      subtitle:
        "Find the right service for every price point. No hourly rates, just project-based pricing.",
    },
    {
      title: "Get quality work done quickly",
      subtitle:
        "Hand your project over to a talented freelancer in minutes, get long-lasting results.",
    },
    {
      title: "Pay when you're happy",
      subtitle:
        "Upfront quotes mean no surprises. Payments only get released when you approve.",
    },
    {
      title: "Count on 24/7 support",
      subtitle:
        "Our round-the-clock support team is available to help anytime, anywhere.",
    },
  ];

  return (
    <div className="bg-zinc-900/30 border-y border-white/5 flex flex-col md:flex-row py-16 md:py-24 justify-between px-6 md:px-24">
      <div className="mx-3 md:w-1/2 flex flex-col justify-center">
        <h2 className="text-3xl md:text-5xl font-outfit mb-8 md:mb-12 text-white font-bold tracking-tight leading-[1.2]">
          The best part? <span className="text-gradient">Everything.</span>
        </h2>
        <ul className="flex flex-col gap-8">
          {everythingData.map(({ title, subtitle }) => {
            return (
              <li key={title} className="group">
                <div className="flex gap-4 items-center text-xl mb-2">
                  <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                    <BsCheckCircle className="text-primary text-2xl shadow-primary/30 drop-shadow-lg" />
                  </div>
                  <h4 className="font-outfit text-white font-semibold text-xl md:text-2xl group-hover:text-accent transition-colors duration-300">{title}</h4>
                </div>
                <p className="text-zinc-400 font-inter text-base md:text-lg leading-relaxed pl-14">{subtitle}</p>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="relative h-[400px] md:h-[600px] md:w-[45%] mt-12 md:mt-0 rounded-[2rem] overflow-hidden shadow-[0_0_40px_rgba(29,191,115,0.15)] group cursor-pointer border border-zinc-800">
        <Image
          src="/everything.jpg"
          fill
          alt="everything"
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};

export default Everything;
