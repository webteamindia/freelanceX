import { useRouter } from "next/router";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FaRegPaperPlane } from "react-icons/fa";
import { BsCheckAll } from "react-icons/bs";
import { useStateProvider } from "../../context/StateContext";
import { useCallback, useEffect, useState } from "react";
import { GET_MESSAGES, SEND_MESSAGE } from "../../utils/constants";
import { Comment } from "react-loader-spinner";
import { useOrderSocket } from "../../hooks/useOrderSocket";

const MessageContainer = () => {
  const [cookies] = useCookies();
  const router = useRouter();
  const { orderId } = router.query;
  const [{ userInfo }] = useStateProvider();
  const [receiverId, setReceiverId] = useState(undefined);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [live, setLive] = useState(false);

  const appendMessage = useCallback((msg) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const fetchMessages = useCallback(
    async (showLoader = false) => {
      if (!orderId || !cookies.jwt) return;
      try {
        if (showLoader) setLoading(true);
        const { data } = await axios.get(`${GET_MESSAGES}/${orderId}`, {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        });
        setMessages(data.messages);
        setReceiverId(data.receiverId);
      } catch (err) {
        console.log(err);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [orderId, cookies.jwt]
  );

  useOrderSocket({
    orderId,
    jwt: cookies.jwt,
    onMessage: (msg) => {
      setLive(true);
      appendMessage(msg);
    },
  });

  useEffect(() => {
    if (!orderId || !userInfo) return;

    fetchMessages(true);
    const intervalId = setInterval(() => fetchMessages(false), 30000);
    return () => clearInterval(intervalId);
  }, [orderId, userInfo, fetchMessages]);

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  }

  const sendMessage = async () => {
    if (!messageText.length) return;
    const response = await axios.post(
      `${SEND_MESSAGE}/${orderId}`,
      {
        message: messageText,
        receiverId,
      },
      {
        headers: {
          Authorization: `Bearer ${cookies.jwt}`,
        },
      }
    );
    if (response.status === 201) {
      appendMessage(response.data.message);
      setMessageText("");
    }
  };

  return (
    <div className="h-[80vh]">
      <div className="max-h-[80vh] flex flex-col justify-center items-center">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 w-[80vw] border flex flex-col">
          {live && (
            <p className="text-xs text-emerald-600 mb-2">Live updates connected</p>
          )}
          <div className="mt-4">
            <div className="space-y-4 h-[50vh] overflow-y-auto pr-4">
              {isLoading && (
                <div className="flex justify-center items-center">
                  <Comment
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="comment-loading"
                    color="#fff"
                    backgroundColor="#F4442E"
                  />
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === userInfo.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg ${
                      message.senderId === userInfo.id
                        ? "bg-[#1DBF73] text-white"
                        : "bg-gray-100 text-gray-800"
                    } px-4 py-2 max-w-xs break-all`}
                  >
                    <p>{message.text}</p>
                    <span className="text-sm text-gray-600">
                      {formatTime(message.createdAt)}
                    </span>
                    <span>
                      {message.senderId === userInfo.id && message.isRead && (
                        <BsCheckAll />
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex">
            <input
              type="text"
              className="rounded-full py-2 px-4 mr-2 w-full"
              placeholder="Type a message..."
              name="message"
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              value={messageText}
            />
            <button
              type="button"
              className="bg-[#1DBF73] text-white rounded-full px-4 py-2"
              onClick={sendMessage}
            >
              <FaRegPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
