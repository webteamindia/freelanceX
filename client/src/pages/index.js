import Business from "../components/Landing/Business";
import Companies from "../components/Landing/Companies";
import Everything from "../components/Landing/Everything";
import HeroBanner from "../components/Landing/HeroBanner";
import JoinFreelance from "../components/Landing/JoinFreelance";
import PopularServices from "../components/Landing/PopularServices";
import Services from "../components/Landing/Services";
import React from "react";
import { useStateProvider } from "../context/StateContext";
import AdsenseAd from "../components/AdsenseAd";

const Index = () => {
  const [{ showLoginModal, showSignupModal }] = useStateProvider();
  return (
    <div>
      <HeroBanner />
      <Companies />
      <PopularServices />
      <AdsenseAd
        slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT}
        className="mx-4 md:mx-32 my-8"
      />
      <Everything />
      <Services />
      <Business />
      <JoinFreelance />
    </div>
  );
};

export default Index;
