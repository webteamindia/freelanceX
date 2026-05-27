import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { SiGooglemessages } from "react-icons/si";
import { toast } from "react-toastify";
import { useStateProvider } from "../../../context/StateContext.jsx";
import ReleasePayoutButton from "../../../components/orders/ReleasePayoutButton";
import { GET_BUYER_ORDERS } from "../../../utils/constants";
import { getPayoutStatusLabel } from "../../../utils/orderStatus";

const BuyerOrdersPage = () => {
  const [cookies] = useCookies();
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [{ userInfo }] = useStateProvider();

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(GET_BUYER_ORDERS, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        });
        setOrders(data.orders || []);
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (userInfo && cookies.jwt) {
      getOrders();
    }
  }, [userInfo, cookies.jwt]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (!normalizedSearch) return true;
    const title = order.gig?.title?.toLowerCase() || "";
    const category = order.gig?.category?.toLowerCase() || "";
    const seller = order.gig?.createdBy?.fullName?.toLowerCase() || "";
    return (
      title.includes(normalizedSearch) ||
      category.includes(normalizedSearch) ||
      seller.includes(normalizedSearch)
    );
  });

  const totalSpent = filteredOrders.reduce(
    (sum, order) => sum + Number(order?.gig?.price || order?.price || 0),
    0
  );

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-6 md:px-20">
      <div className="m-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h3 className="text-3xl font-semibold">Your Orders</h3>
        <input
          className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-4 py-2 w-full md:w-80 outline-none focus:border-primary"
          placeholder="Search by gig, category, or seller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mx-5 mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total completed orders</p>
          <p className="text-2xl font-semibold">{filteredOrders.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Total spent</p>
          <p className="text-2xl font-semibold">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm">Unread messages</p>
          <Link href="/buyer/unread-messages" className="text-primary hover:underline">
            Open inbox
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="mx-5 text-zinc-400">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="mx-5 bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-zinc-400">
          No orders found yet.
        </div>
      ) : (
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
                Payout
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
              <th scope="col" className="px-6 py-3">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const payout = getPayoutStatusLabel(order.payoutStatus);
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
                      src={order.gig.createdBy.profileImage || "/default_profile.png"}
                      alt={order.gig.createdBy.username}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    {order.gig.createdBy.fullName}
                  </td>
                  <td className="px-6 py-4">{order.createdAt.split("T")[0]}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${payout.className}`}
                    >
                      {payout.text}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ReleasePayoutButton
                      order={order}
                      onReleased={(updated) => {
                        setOrders((prev) =>
                          prev.map((o) => (o.id === updated.id ? updated : o))
                        );
                      }}
                    />
                  </td>
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
      )}
    </div>
  );
};

export default BuyerOrdersPage;
