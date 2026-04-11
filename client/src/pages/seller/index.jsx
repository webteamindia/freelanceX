import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useStateProvider } from "../../context/StateContext";
import { GET_SELLER_DATA } from "../../utils/constants";

function Index() {
  const [cookies] = useCookies();
  const [{ userInfo }] = useStateProvider();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(undefined);

  useEffect(() => {
    const getSellerDashboardData = async () => {
      const response = await axios.get(GET_SELLER_DATA, {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
        },
      });
      if (response.status === 200) {
        setDashboardData(response.data.dashboardData);
      }
      console.log({ response });
    };
    if (userInfo) {
      getSellerDashboardData();
    }
  }, [userInfo]);

  return (
    <div className="min-h-[80vh] flex flex-col justify-center bg-background text-white">
      {!userInfo ? (
        <div className="flex flex-col justify-center items-center h-[70vh] px-4 animate-[fade-in_1s_ease-out]">
          <h1 className="text-5xl md:text-7xl font-outfit font-extrabold text-center tracking-tight mb-4">
            Become a <span className="text-primary">Seller</span> today.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl text-center max-w-2xl font-inter mb-10">
            Join the world's most premium freelance talent network. Start offering your professional services, reach global clients, and earn entirely on your own terms.
          </p>
          <button
            className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl text-xl font-bold font-outfit transition-all duration-300 shadow-[0_0_20px_rgba(29,191,115,0.4)] hover:shadow-[0_0_35px_rgba(29,191,115,0.6)] hover:-translate-y-1"
            onClick={() => router.push("/signup")}
          >
            Get Started Now
          </button>
        </div>
      ) : (
        <div className="flex min-h-[80vh] my-10 mt-0 px-32 gap-5">
          <div className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-col gap-5 min-w-96 w-96">
            <div className="flex gap-5 justify-center items-center">
              <div>
                {userInfo?.imageName ? (
                  <Image
                    src={userInfo.imageName}
                    alt="Profile"
                    width={140}
                    height={140}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-purple-500 h-24 w-24 flex items-center justify-center rounded-full relative">
                    <span className="text-5xl text-white">
                      {userInfo.email[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[#62646a] text-lg font-medium">
                  {userInfo.username}
                </span>
                <span className="font-bold text-md">{userInfo.fullName}</span>
              </div>
            </div>

            <div className="border-t py-5">
              <p>{userInfo.description}</p>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-3 gap-10 w-full">
              <div
                className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => router.push("/seller/gigs")}
              >
                <h2 className="text-xl">Total Gigs</h2>
                <h3 className="text-primary text-3xl font-extrabold">
                  {dashboardData?.gigs}
                </h3>
              </div>

              <div
                className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => router.push("/seller/orders")}
              >
                <h2 className="text-xl">Total Orders</h2>
                <h3 className="text-primary text-3xl font-extrabold">
                  {dashboardData?.orders}
                </h3>
              </div>

              <div
                className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-nowrap flex-col gap-2 cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => router.push("/seller/unread-messages")}
              >
                <h2 className="text-xl"> Unread Messages</h2>
                <h3 className="text-primary text-3xl font-extrabold">
                  {dashboardData?.unreadMessages}
                </h3>
              </div>

              <div className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl">Earnings Today</h2>
                <h3 className="text-primary text-3xl font-extrabold">
                  ${dashboardData?.dailyRevenue}
                </h3>
              </div>

              <div className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl">Earnings Monthly</h2>
                <h3 className="text-primary text-3xl font-extrabold">
                  ${dashboardData?.monthlyRevenue}
                </h3>
              </div>

              <div className="shadow-[0_10px_30px_rgba(0,0,0,0.4)] h-max p-10 flex flex-col gap-2 cursor-pointer hover:shadow-xl transition-all duration-300">
                <h2 className="text-xl">Earnings Yearly</h2>
                <h3 className="text-primary text-3xl font-extrabold">
                  ${dashboardData?.revenue}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
