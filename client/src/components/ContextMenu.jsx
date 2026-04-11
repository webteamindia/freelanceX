import { useRouter } from "next/router";
import React from "react";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";

function ContextMenu({ data }) {
  const router = useRouter();
  return (
    <div
      className={`z-10 bg-zinc-900 border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.6)] w-48 fixed right-5 top-20 rounded-xl overflow-hidden py-1`}
    >
      <ul className="text-sm text-zinc-300 font-inter divide-y divide-zinc-800/50">
        {data.map(({ name, callback }, index) => {
          return (
            <li
              key={index}
              onClick={callback}
              className="px-4 py-3 cursor-pointer hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-3"
            >
              {name === "Logout" ? <FiLogOut className="text-lg text-primary" /> : null}
              {name === "Profile" ? <RxAvatar className="text-lg text-primary" /> : null}
              <span className="flex-1 font-medium">{name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ContextMenu;
