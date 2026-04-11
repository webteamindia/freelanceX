import React, { useEffect, useState } from "react";
import { GET_ALL_USER_GIGS_ROUTE } from "../../../utils/constants";
import axios from "axios";
import Link from "next/link";
import { useCookies } from "react-cookie";

const index = () => {
  const [cookies] = useCookies();
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    const getUserGigs = async () => {
      try {
        const { data } = await axios.get(GET_ALL_USER_GIGS_ROUTE, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        });
        console.log(data);
        setGigs(data.gigs);
      } catch (err) {
        console.log(err);
      }
    };
    getUserGigs();
  }, []);

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-32 ">
      <h3 className="m-5 text-3xl font-semibold"> All Your Gigs</h3>
      <div className="relative overflow-x-auto shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:rounded-2xl">
        <table className="w-full text-sm text-left text-zinc-400 dark:text-zinc-500">
          <thead className="text-xs text-zinc-300 uppercase bg-background dark:bg-zinc-700 dark:text-zinc-500">
            <tr>
              <th scope="col" className="px-6 py-3">
                Title
              </th>
              <th scope="col" className="px-6 py-3">
                Category
              </th>
              <th scope="col" className="px-6 py-3">
                Delivery Time
              </th>
              <th scope="col" className="px-6 py-3">
                Price
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {gigs.map(({ title, category, deliveryTime, price, id }) => {
              return (
                <tr className="bg-zinc-900 border border-zinc-800 border-b dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-800 dark:hover:bg-zinc-600">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-white whitespace-nowrap dark:text-white"
                  >
                    {title}
                  </th>
                  <td className="px-6 py-4">{category}</td>
                  <td className="px-6 py-4">{deliveryTime} Days</td>
                  <td className="px-6 py-4">$ {price}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      href={`/seller/gigs/${id}`}
                    >
                      Edit
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
