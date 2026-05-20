import { useStateProvider } from "../../context/StateContext";
import { GET_UNREAD_MESSAGES, MARK_AS_READ_ROUTE } from "../../utils/constants";
import { useCookies } from "react-cookie";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

function BuyerUnreadMessages() {
  const [cookies] = useCookies();
  const [{ userInfo }] = useStateProvider();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const getUnreadMessages = async () => {
      try {
        const {
          data: { messages: unreadMessages },
        } = await axios.get(GET_UNREAD_MESSAGES, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        });
        setMessages(unreadMessages || []);
      } catch (error) {
        console.error(error);
        toast.error("Could not load unread messages.");
      }
    };

    if (userInfo && cookies.jwt) {
      getUnreadMessages();
    }
  }, [userInfo, cookies.jwt]);

  const markAsRead = async (id) => {
    try {
      const response = await axios.put(
        `${MARK_AS_READ_ROUTE}/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        }
      );

      if (response.status === 200) {
        setMessages((prev) => prev.filter((message) => message.id !== id));
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not mark message as read.");
    }
  };

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-6 md:px-20">
      <h3 className="m-5 text-2xl font-semibold">Unread Messages</h3>
      <div className="relative overflow-x-auto shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:rounded-2xl">
        <table className="w-full text-sm text-left text-zinc-400 dark:text-zinc-500">
          <thead className="text-xs text-zinc-300 uppercase bg-background dark:bg-zinc-700 dark:text-zinc-500">
            <tr>
              <th scope="col" className="px-6 py-3">
                Text
              </th>
              <th scope="col" className="px-6 py-3">
                Sender Name
              </th>
              <th scope="col" className="px-6 py-3">
                Order Id
              </th>
              <th scope="col" className="px-6 py-3">
                Mark as Read
              </th>
              <th scope="col" className="px-6 py-3">
                View Conversation
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => {
              return (
                <tr
                  className="bg-zinc-900 border border-zinc-800 dark:bg-zinc-800 hover:bg-zinc-800"
                  key={message.id}
                >
                  <th scope="row" className="px-6 py-4 ">
                    {message?.text}
                  </th>
                  <th scope="row" className="px-6 py-4 ">
                    {message?.sender?.fullName}
                  </th>
                  <th scope="row" className="px-6 py-4 font-medium">
                    {message.orderId}
                  </th>
                  <td className="px-6 py-4 ">
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        markAsRead(message.id);
                      }}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Mark as Read
                    </Link>
                  </td>
                  <td className="px-6 py-4 ">
                    <Link
                      href={`/buyer/orders/messages/${message.orderId}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      View
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
}

export default BuyerUnreadMessages;
