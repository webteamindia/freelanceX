import Link from "next/link";
import React from "react";
const Footer = () => {
  return (
    <footer className="w-full md:px-20 py-6 md:py-8 h-max border-t border-gray-200 bg-gray-100">
      <div className="mt-2 flex flex-col-reverse gap-5 md:flex-row md:justify-between ">
        <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:gap-4">
          <span>
            <span className="text-2xl md:text-3xl font-bold text-green-500">
              ff
            </span>
            <span className="text-2xl md:text-3xl font-bold ml-1">iver</span>
          </span>
          <p className="text-gray-400"> &copy; ffiver Global Inc. 2026</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <Link href="/help" className="hover:text-[#1DBF73]">
              Help
            </Link>
            <Link href="/contact" className="hover:text-[#1DBF73]">
              Contact
            </Link>
            <Link href="/terms" className="hover:text-[#1DBF73]">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-[#1DBF73]">
              Privacy
            </Link>
          </div>
        </div>
        <div className="place-self-center text-sm text-gray-400">
          {/* Social links coming soon */}
        </div>
      </div>
      <p className="text-center mt-4 font-medium">
        Made With Sleepless Nights! 🌙
      </p>
    </footer>
  );
};

export default Footer;
