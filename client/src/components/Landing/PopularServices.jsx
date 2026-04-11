import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useRouter } from "next/router";
import { FcNext, FcPrevious } from "react-icons/fc";

/** react-slick passes extra props; only forward safe ones to avoid DOM warnings. */
function SliderNextArrow({ className, style, onClick }) {
  return (
    <button
      type="button"
      aria-label="Next slide"
      className={className}
      style={style}
      onClick={onClick}
    >
      <FcNext className="text-2xl" />
    </button>
  );
}

function SliderPrevArrow({ className, style, onClick }) {
  return (
    <button
      type="button"
      aria-label="Previous slide"
      className={className}
      style={style}
      onClick={onClick}
    >
      <FcPrevious className="text-2xl" />
    </button>
  );
}

const PopularServices = () => {
  const router = useRouter();

  const popularServices = [
    { name: "Ai Artists", label: "Add talent to AI", image: "/service1.png" },
    { name: "Logo Design", label: "Build your brand", image: "/service2.jpeg" },
    {
      name: "Wordpress",
      label: "Customize your site",
      image: "/service3.jpeg",
    },
    {
      name: "Voice Over",
      label: "Share your message",
      image: "/service4.jpeg",
    },
    {
      name: "Social Media",
      label: "Reach more customers",
      image: "/service5.jpeg",
    },
    { name: "SEO", label: "Unlock growth online", image: "/service6.jpeg" },
    {
      name: "Illustration",
      label: "Color your dreams",
      image: "/service7.jpeg",
    },
    { name: "Translation", label: "Go global", image: "/service8.jpeg" },
  ];

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
    nextArrow: <SliderNextArrow />,
    prevArrow: <SliderPrevArrow />,
  };

  return (
    <div className="mx-6 md:mx-20 my-16 md:my-28">
      <h2 className="text-3xl md:text-5xl font-outfit mb-10 md:mb-14 text-white font-bold tracking-tight">
        Popular <span className="text-gradient">services</span>
      </h2>
      <Slider {...settings}>
        {popularServices.map(({ name, label, image }) => (
          <div key={name} className="p-4 px-2 md:px-4">
            <div
              className="group relative cursor-pointer transition-all duration-500 transform hover:-translate-y-2 rounded-[2rem] shadow-lg hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.4)] overflow-hidden"
              onClick={() => router.push(`/search?q=${name.toLowerCase()}`)}
            >
              <div className="h-64 md:h-96 w-full relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-zinc-800">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90 z-0 transition-opacity duration-300 group-hover:opacity-90"></div>
              </div>
              
              <div className="absolute z-10 text-white left-6 top-6 right-6">
                <span className="text-xs md:text-sm font-medium text-zinc-300 tracking-widest uppercase">{label}</span>
                <h6 className="font-outfit font-bold text-2xl md:text-3xl mt-1 leading-tight group-hover:text-accent transition-colors duration-300">{name}</h6>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default PopularServices;
