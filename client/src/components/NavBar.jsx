import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { IoSearchOutline } from "react-icons/io5";
import { RiCloseLine, RiMenu3Line } from "react-icons/ri";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import { GET_USER_INFO } from "../utils/constants";
import ContextMenu from "./ContextMenu";

const NavBar = () => {
  const router = useRouter();
  const [cookies] = useCookies();
  const [isLoaded, setIsLoaded] = useState(false);
  const [navFixed, setNavFixed] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const [{ showLoginModal, showSignupModal, isSeller, userInfo }, dispatch] =
    useStateProvider();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const links = [
    { linkName: "How it works", handler: "/how-it-works", type: "link" },
    { linkName: "Explore", handler: "/search", type: "link" },
    { linkName: "Pricing", handler: "/pricing", type: "link" },
    { linkName: "Become a Seller", handler: "/seller", type: "link" },
    { linkName: "Contact", handler: "/contact", type: "link" },
    ...(process.env.NODE_ENV === "development"
      ? [
          {
            linkName: "Dev",
            handler: "/dev",
            type: "link",
          },
        ]
      : []),
    { linkName: "Sign in", handler: handleLogin, type: "button" },
    { linkName: "Join", handler: handleSignup, type: "button2" },
  ];

  useEffect(() => {
    if (router.pathname === "/") {
      const positionNavbar = () => {
        window.scrollY > 0 ? setNavFixed(true) : setNavFixed(false);
      };
      window.addEventListener("scroll", positionNavbar);
      return () => window.removeEventListener("scroll", positionNavbar);
    } else {
      setNavFixed(true);
    }
  }, [router.pathname]);

  const handleOrdersNavigate = () => {
    if (isSeller) router.push("/seller/orders");
    router.push("/buyer/orders");
  };

  const handleModeSwitch = () => {
    if (isSeller) {
      dispatch({ type: reducerCases.SWITCH_MODE });
      router.push("/buyer/orders");
    } else {
      dispatch({ type: reducerCases.SWITCH_MODE });
      router.push("/seller");
    }
  };

  useEffect(() => {
    if (cookies.jwt) {
      const getUserInfo = async () => {
        try {
          const {
            data: { user },
          } = await axios.post(
            GET_USER_INFO,
            {},
            {
              headers: {
                Authorization: `Bearer ${cookies.jwt}`,
              },
            }
          );
          let projectedUserInfo = { ...user };
          if (user.profileImage) {
            projectedUserInfo = {
              ...projectedUserInfo,
              imageName: user.profileImage,
            };
          }
          delete projectedUserInfo.profileImage;
          dispatch({
            type: reducerCases.SET_USER,
            userInfo: projectedUserInfo,
          });
          setIsLoaded(true);
          if (user.isProfileInfoSet === false) {
            router.push("/profile");
          }
        } catch (err) {
          console.log(err);
          toast.error("Something went wrong");
        }
      };
      getUserInfo();
    } else {
      setIsLoaded(true);
    }
  }, [cookies, dispatch]);

  const [isContextMenuVisible, setIsContextMenuVisible] = useState(false);
  useEffect(() => {
    const clickListener = (e) => {
      e.stopPropagation();
      if (isContextMenuVisible) setIsContextMenuVisible(false);
    };
    if (isContextMenuVisible) {
      window.addEventListener("click", clickListener);
    }
    return () => {
      window.removeEventListener("click", clickListener);
    };
  }, [isContextMenuVisible]);

  const ContextMenuData = [
    {
      name: "Profile",
      callback: (e) => {
        e.stopPropagation();
        setIsContextMenuVisible(false);
        router.push("/profile");
      },
    },
    {
      name: "Saved gigs",
      callback: (e) => {
        e.stopPropagation();
        setIsContextMenuVisible(false);
        router.push("/favorites");
      },
    },
    {
      name: "Help",
      callback: (e) => {
        e.stopPropagation();
        setIsContextMenuVisible(false);
        router.push("/help");
      },
    },
    ...(userInfo?.isAdmin
      ? [
          {
            name: "Admin",
            callback: (e) => {
              e.stopPropagation();
              setIsContextMenuVisible(false);
              router.push("/admin");
            },
          },
        ]
      : []),
    {
      name: "Logout",
      callback: (e) => {
        e.stopPropagation();
        setIsContextMenuVisible(false);
        router.push("/logout");
      },
    },
  ];

  return (
    <>
      {isLoaded && (
        <>
          <nav
            className={`w-full px-6 md:px-12 lg:px-20 flex justify-between items-center py-4 top-0 z-30 transition-all duration-500 ${
              navFixed || userInfo
                ? "fixed bg-zinc-950/80 backdrop-blur-2xl border-b border-white/5 shadow-sm"
                : "absolute bg-transparent border-transparent"
            }`}
          >
            <div className="flex items-center">
              <Link href="/">
                <p className="text-white font-outfit">
                  <span className="text-2xl md:text-3xl font-bold flex items-center tracking-tighter">
                    <b className="text-primary text-3xl md:text-4xl">ff</b>
                    <span className="text-2xl md:text-3xl font-bold ml-1">
                      iver
                    </span>
                  </span>
                </p>
              </Link>
            </div>

            <div
              className={`hidden lg:flex items-center w-[36rem] transition-all duration-500 transform ${
                navFixed || userInfo ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <input
                type="text"
                className="w-full py-3 px-6 border border-zinc-800 bg-zinc-900 text-white rounded-l-2xl font-inter focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-zinc-500"
                value={searchData}
                onChange={(e) => setSearchData(e.target.value)}
                placeholder="What service are you looking for today?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchData("");
                    router.push(`/search?q=${searchData}`);
                  }
                }}
              />
              <button
                className="bg-primary hover:bg-primary-hover py-3 text-white w-16 h-full flex justify-center items-center rounded-r-2xl transition-all duration-300 shadow-[0_4px_14px_rgba(29,191,115,0.2)] hover:shadow-[0_6px_20px_rgba(29,191,115,0.4)] border border-primary hover:border-primary-hover"
                onClick={() => {
                  setSearchData("");
                  router.push(`/search?q=${searchData}`);
                }}
              >
                <IoSearchOutline className="fill-white text-white h-6 w-6" />
              </button>
            </div>

            <div className="hidden md:block">
              {!userInfo ? (
                <ul className="flex gap-8 items-center">
                  {links.map(({ linkName, handler, type }) => (
                    <li
                      key={linkName}
                      className={`text-zinc-300 font-inter font-medium hover:text-white transition-all duration-200`}
                    >
                      {type === "link" && (
                        <Link href={handler} className="hover:text-primary transition-colors">{linkName}</Link>
                      )}
                      {type === "button" && (
                        <button onClick={handler} className="hover:text-primary transition-colors">{linkName}</button>
                      )}
                      {type === "button2" && (
                        <button
                          onClick={handler}
                          className={`border-2 text-md font-outfit font-semibold py-2 px-6 rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(29,191,115,0.4)] ml-2`}
                        >
                          {linkName}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="flex gap-10 items-center text-sm font-inter">
                  {process.env.NODE_ENV === "development" && (
                    <li className="font-medium text-zinc-400">
                      <Link href="/dev" className="hover:text-primary transition-colors">
                        Dev
                      </Link>
                    </li>
                  )}
                  {isSeller && (
                    <li
                      className="cursor-pointer text-primary hover:text-primary-hover transition-colors font-medium"
                      onClick={() => router.push("/seller/gigs/create")}
                    >
                      Create Gig
                    </li>
                  )}
                  <li
                    className="cursor-pointer text-primary hover:text-primary-hover transition-colors font-medium"
                    onClick={handleOrdersNavigate}
                  >
                    Orders
                  </li>
                  <li
                    className="cursor-pointer text-primary hover:text-primary-hover transition-colors font-medium"
                    onClick={() => router.push("/favorites")}
                  >
                    Saved
                  </li>
                  <li className="font-medium text-zinc-300 hover:text-white transition-colors">
                    <Link href="/contact" className="hover:text-primary transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li
                    className="cursor-pointer text-zinc-300 hover:text-white transition-colors font-medium"
                    onClick={handleModeSwitch}
                  >
                    {isSeller ? "Switch To Buyer" : "Switch To Seller"}
                  </li>
                  {userInfo?.isAdmin && (
                    <li className="cursor-pointer font-medium">
                      <Link href="/admin">Admin</Link>
                    </li>
                  )}
                  <li
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsContextMenuVisible(true);
                    }}
                    title="Profile"
                  >
                    {userInfo?.imageName ? (
                      <div className="relative h-10 w-10 rounded-full border border-zinc-800 shadow-md hover:shadow-[0_0_15px_rgba(29,191,115,0.3)] transition-all overflow-hidden">
                        <Image
                          src={userInfo.imageName}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="bg-primary hover:bg-primary-hover transition-colors h-10 w-10 flex items-center justify-center rounded-full relative shadow-md hover:shadow-[0_0_15px_rgba(29,191,115,0.4)]">
                        <span className="text-xl font-bold font-outfit text-white">
                          {userInfo &&
                            userInfo?.email &&
                            userInfo?.email.split("")[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </li>
                </ul>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-white p-2 z-50 relative`}
              >
                {isOpen ? (
                  <RiCloseLine className="h-6 w-6" />
                ) : (
                  <RiMenu3Line className="h-6 w-6" />
                )}
              </button>
            </div>
          </nav>
          {isOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
              onClick={() => setIsOpen(false)}
            />
          )}

          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden px-6 ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <button
              className="absolute right-6 top-6 text-zinc-400 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <RxCross1 size={28} />
            </button>
            <div className="h-full flex flex-col pt-24">
              <div className="pb-6 border-b border-zinc-800">
                <div className="flex">
                  <input
                    type="text"
                    className="flex-1 p-3 border border-zinc-700 bg-zinc-900 focus:outline-none focus:border-primary text-white rounded-l-xl font-inter placeholder:text-zinc-500"
                    placeholder="Search..."
                    value={searchData}
                    onChange={(e) => setSearchData(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        router.push(`/search?q=${searchData}`);
                        setIsOpen(false);
                      }
                    }}
                  />
                  <button
                    className="px-5 bg-primary hover:bg-primary-hover text-white rounded-r-xl transition-colors"
                    onClick={() => {
                      router.push(`/search?q=${searchData}`);
                      setIsOpen(false);
                    }}
                  >
                    <IoSearchOutline className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 hide-scrollbar">
                {!userInfo ? (
                  <div className="py-4 flex flex-col items-start gap-4 font-inter">
                    {links.map(({ linkName, handler, type }) => (
                      <div
                        key={linkName}
                        className="w-full"
                        onClick={() => {
                          if (typeof handler === "function" && type !== "button2") handler();
                          setIsOpen(false);
                        }}
                      >
                        {type === "link" && (
                          <Link href={handler} className="block w-full text-zinc-300 hover:text-primary text-lg font-medium transition-colors">
                            {linkName}
                          </Link>
                        )}
                        {type === "button" && (
                          <button className="w-full text-left text-zinc-300 hover:text-primary text-lg font-medium transition-colors" onClick={handler}>{linkName}</button>
                        )}
                        {type === "button2" && (
                          <button onClick={handler} className="w-full py-3 mt-4 text-center border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-xl font-semibold transition-all duration-300 text-lg">
                            {linkName}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-start gap-5 font-inter">
                    {isSeller && (
                      <div
                        className="w-full text-left text-primary hover:text-primary-hover font-medium text-lg cursor-pointer transition-colors"
                        onClick={() => {
                          router.push("/seller/gigs/create");
                          setIsOpen(false);
                        }}
                      >
                        Create Gig
                      </div>
                    )}
                    <div
                      className="w-full text-left text-primary hover:text-primary-hover font-medium text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        handleOrdersNavigate();
                        setIsOpen(false);
                      }}
                    >
                      Orders
                    </div>
                    <div
                      className="w-full text-left text-zinc-300 hover:text-primary font-medium text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/favorites");
                        setIsOpen(false);
                      }}
                    >
                      Saved gigs
                    </div>
                    <div
                      className="w-full text-left text-zinc-300 hover:text-primary font-medium text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/contact");
                        setIsOpen(false);
                      }}
                    >
                      Contact
                    </div>
                    <div
                      className="w-full text-left text-zinc-300 hover:text-white font-medium text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        handleModeSwitch();
                        setIsOpen(false);
                      }}
                    >
                      {isSeller ? "Switch To Buyer" : "Switch To Seller"}
                    </div>
                    <div className="w-full h-px bg-zinc-800 my-2"></div>
                    <div
                      className="w-full text-left text-zinc-300 hover:text-primary font-medium text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/profile");
                        setIsOpen(false);
                      }}
                    >
                      Profile
                    </div>
                    <div
                      className="w-full text-left text-zinc-300 hover:text-primary font-medium text-lg cursor-pointer transition-colors"
                      onClick={() => {
                        router.push("/help");
                        setIsOpen(false);
                      }}
                    >
                      Help
                    </div>
                    {userInfo?.isAdmin && (
                      <div
                        className="w-full text-left text-zinc-300 hover:text-primary font-medium text-lg cursor-pointer transition-colors"
                        onClick={() => {
                          router.push("/admin");
                          setIsOpen(false);
                        }}
                      >
                        Admin Panel
                      </div>
                    )}
                    {process.env.NODE_ENV === "development" && (
                      <div
                        className="w-full text-left text-zinc-500 hover:text-primary font-medium text-lg cursor-pointer transition-colors"
                        onClick={() => {
                          router.push("/dev");
                          setIsOpen(false);
                        }}
                      >
                        Dev
                      </div>
                    )}
                    <div
                      className="w-full text-left font-medium text-lg cursor-pointer mt-4 py-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl text-center rounded-sm transition-all duration-300"
                      onClick={() => {
                        router.push("/logout");
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {isContextMenuVisible && <ContextMenu data={ContextMenuData} />}
        </>
      )}
    </>
  );
};

export default NavBar;
