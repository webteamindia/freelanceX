import Image from "next/image";
import React from "react";
import { useStateProvider } from "../../context/StateContext";
import { reducerCases } from "../../context/constants";

function JoinFreelance() {
  const [{ showLoginModal, showSignupModal }, dispatch] = useStateProvider();

  const handleSignup = () => {
    if (showLoginModal) {
      dispatch({
        type: reducerCases.TOGGLE_LOGIN_MODAL,
        showLoginModal: false,
      });
    }
    dispatch({
      type: reducerCases.TOGGLE_SIGNUP_MODAL,
      showSignupModal: true,
    });
  };

  return (
    <div className="mx-6 my-16 md:mx-32 md:my-28 relative rounded-[2rem] overflow-hidden shadow-2xl border border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-10 pointer-events-none"></div>
      
      <div className="absolute z-20 top-1/2 -translate-y-1/2 left-8 md:left-16 max-w-[600px]">
        <p className="text-sm md:text-base font-bold mb-4 text-primary tracking-widest uppercase font-inter">
          20X Faster than hiring
        </p>
        <h4 className="text-white text-4xl md:text-6xl mb-8 font-outfit font-bold leading-tight">
          Efficient. Scalable. <br/> Hella <i className="text-gradient">reliable.</i>
        </h4>
        <button
          className="border-2 font-semibold px-8 py-4 rounded-xl transition-all duration-300 border-primary bg-primary text-white hover:bg-zinc-900/50 hover:text-primary hover:shadow-[0_0_20px_rgba(29,191,115,0.4)] backdrop-blur-sm"
          type="button"
          onClick={handleSignup}
        >
          Join ffiver
        </button>
      </div>
      <div className="h-[400px] w-full md:h-[500px]">
        <Image src="/signup.png" fill alt="signup" className="object-cover" />
      </div>
    </div>
  );
}

export default JoinFreelance;
