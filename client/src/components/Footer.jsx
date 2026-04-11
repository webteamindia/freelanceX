import Link from "next/link";
import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 mx-auto">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-6">
              <span className="text-4xl md:text-5xl font-outfit font-bold text-primary tracking-tighter">
                ff
              </span>
              <span className="text-4xl md:text-5xl font-outfit font-bold tracking-tight text-white">
                iver
              </span>
            </Link>
            <p className="text-zinc-400 font-inter text-sm md:text-base max-w-sm mb-8 leading-relaxed">
              The premier destination for the world&apos;s best freelance talent. 
              Elevate your projects with world-class professionals ready to bring your vision to life.
            </p>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <FaLinkedin size={18} />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <FaFacebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-outfit font-semibold text-lg mb-6">Categories</h4>
            <ul className="flex flex-col gap-4 text-zinc-400 font-inter text-sm">
              <li><Link href="/search?category=Graphics%20%26%20Design" className="hover:text-primary transition-colors">Graphics & Design</Link></li>
              <li><Link href="/search?category=Digital%20Marketing" className="hover:text-primary transition-colors">Digital Marketing</Link></li>
              <li><Link href="/search?category=Writing%20%26%20Translation" className="hover:text-primary transition-colors">Writing & Translation</Link></li>
              <li><Link href="/search?category=Video%20%26%20Animation" className="hover:text-primary transition-colors">Video & Animation</Link></li>
              <li><Link href="/search?category=Programming%20%26%20Tech" className="hover:text-primary transition-colors">Programming & Tech</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-outfit font-semibold text-lg mb-6">About</h4>
            <ul className="flex flex-col gap-4 text-zinc-400 font-inter text-sm">
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-primary transition-colors">Press & News</Link></li>
              <li><Link href="/partnerships" className="hover:text-primary transition-colors">Partnerships</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-outfit font-semibold text-lg mb-6">Support</h4>
            <ul className="flex flex-col gap-4 text-zinc-400 font-inter text-sm">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help & Support</Link></li>
              <li><Link href="/trust" className="hover:text-primary transition-colors">Trust & Safety</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">Selling on ffiver</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">Buying on ffiver</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 font-inter text-sm">
            &copy; ffiver Global Inc. 2026. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-zinc-500 text-sm font-inter">
            <span>Made With Sleepless Nights</span>
            <span className="text-primary text-base">🌙</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
