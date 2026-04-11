import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SiGooglemessages } from "react-icons/si";
import { toast } from "react-toastify";
import { useStateProvider } from "../../../context/StateContext.jsx";
import { GET_BUYER_ORDERS } from "../../../utils/constants";

const index = () => {
  const [cookies] = useCookies();

  const [orders, setOrders] = useState([]);
  const [{ userInfo }] = useStateProvider();

  useEffect(() => {
    const getOrders = async () => {
      try {
        const { data } = await axios.get(GET_BUYER_ORDERS, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        });
        console.log(data.orders);
        setOrders(data.orders);
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    };

    if (userInfo) {
      getOrders();
    }
  }, [userInfo]);

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-32 ">
      <h3 className="m-5 text-3xl font-semibold"> All Your Orders </h3>
      <div className="relative overflow-x-auto shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:rounded-2xl">
        <table className="w-full text-sm text-left text-zinc-200 dark:text-zinc-500">
          <thead className="text-xs text-zinc-200 uppercase bg-background dark:bg-zinc-700 dark:text-zinc-500">
            <tr>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                Delivery Time
              </th>
              <th scope="col" className="px-6 py-3">
                Seller
              </th>
              <th scope="col" className="px-6 py-3">
                Order Date
              </th>
              <th scope="col" className="px-6 py-3">
                Send Message
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              return (
                <tr
                  className="bg-zinc-900 border border-zinc-800 border-b dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600"
                  key={order.id}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-white whitespace-nowrap dark:text-white"
                  >
                    {order.gig.title}
                  </th>
                  <td className="px-6 py-4">{order.gig.category}</td>
                  <td className="px-6 py-4">
                    <span className=" font-medium">💲 {order.gig.price}</span>{" "}
                  </td>
                  <td className="px-6 py-4">{order.gig.deliveryTime} days</td>
                  <td className="px-6 py-4 flex flex-col place-items-center ">
                    <Image
                      src={order.gig.createdBy.profileImage}
                      alt={order.gig.createdBy.username}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    {order.gig.createdBy.fullName}
                  </td>
                  <td className="px-6 py-4">{order.createdAt.split("T")[0]}</td>
                  <td className="px-6 py-4">
                    <Link
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      href={`/buyer/orders/messages/${order.id}`}
                    >
                      <SiGooglemessages fill="green" size={30} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default index;
