import { LOGIN_ROUTE, SIGNUP_ROUTE } from "../utils/constants";
import axios from "axios";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { FcGoogle } from "react-icons/fc";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

const AuthForm = ({ type }) => {
  const [cookies, setCookies] = useCookies();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const authCookieOptions = {
    path: "/",
    maxAge: 3 * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  const [{}, dispatch] = useStateProvider();
  const [values, setValues] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { email, password } = values;
      if (!email || !password) {
        toast.error("Please fill all the fields.");
        setLoading(false);
        return;
      }

      const emailPattern = /^\w+@[\w.-]+\.\w{2,4}$/;

      if (!emailPattern.test(email)) {
        toast.error("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      const {
        data: { user, jwt },
      } = await axios.post(
        type === "login" ? LOGIN_ROUTE : SIGNUP_ROUTE,
        values,
        { withCredentials: true }
      );
      setCookies("jwt", jwt, authCookieOptions);
      if (user) {
        dispatch({ type: reducerCases.SET_USER, userInfo: user });
        toast.success(type === "login" ? "Welcome back!" : "Account created successfully!");
        router.push("/");
      }
      setLoading(false);
    } catch (err) {
      console.error("Auth error:", err);
      if (axios.isAxiosError(err)) {
        const resp = err.response;
        const data = resp?.data;
        const message =
          typeof data === "string"
            ? data
            : data?.error || data?.message || "An error occurred";

        toast.error(message);
      } else {
        toast.error(err?.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/auth/google-callback" });
    } catch (err) {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center py-20 px-4 bg-background">
      <div className="w-full max-w-[450px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col justify-center items-center relative overflow-hidden mt-10">
        
        <div className="flex flex-col justify-center items-center p-8 md:p-10 w-full gap-8">
          <div className="text-center mt-2">
            <h3 className="text-3xl font-outfit font-bold text-white mb-2 tracking-tight">
              {type === "login"
                ? "Welcome back"
                : "Join ffiver"}
            </h3>
            <p className="text-zinc-400 font-inter text-sm">
              {type === "login"
                ? "Enter your details to access your account."
                : "Sign up to start your journey with us!"}
            </p>
          </div>

          <form className="flex flex-col gap-4 w-full" onSubmit={handleClick}>
            <input
              type="text"
              name="email"
              placeholder="Email Address"
              className="bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 p-4 rounded-xl w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-inter"
              value={values.email}
              onChange={handleChange}
            />
            <input
              type="password"
              placeholder="Password"
              className="bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 p-4 rounded-xl w-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-inter"
              name="password"
              value={values.password}
              onChange={handleChange}
            />

            {type === "login" && (
              <div className="flex justify-end w-full px-1">
                <Link
                  href="/forgot-password"
                  className="text-primary hover:text-primary-hover transition-colors text-sm cursor-pointer font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              className="bg-primary hover:bg-[length:200%_200%] text-white text-lg font-outfit font-semibold rounded-xl p-4 w-full flex justify-center items-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(29,191,115,0.4)] mt-2"
              type="submit"
            >
              {loading ? (
                <ThreeDots
                  height={28}
                  width={50}
                  color="#ffffff"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              ) : (
                "Continue"
              )}
            </button>

            <div className="relative w-full text-center my-4">
              <span className="before:content-[''] before:h-[1px] before:w-full before:absolute before:top-[50%] before:left-0 before:bg-zinc-800">
                <span className="bg-zinc-900 relative z-10 px-4 text-sm text-zinc-500 font-medium tracking-widest">OR</span>
              </span>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-white p-4 rounded-xl font-medium w-full flex items-center justify-center relative transition-colors font-inter"
              >
                <FcGoogle className="absolute left-6 text-2xl" />
                Continue with Google
              </button>
            </div>
          </form>
        </div>
        
        <div className="py-6 w-full flex items-center justify-center border-t border-zinc-800 bg-zinc-950/50">
          <span className="text-sm text-zinc-400 font-inter">
            {type === "login" ? (
              <>
                Don't have an account?&nbsp;
                <Link
                  href="/signup"
                  className="text-primary hover:text-primary-hover font-medium cursor-pointer transition-colors"
                >
                  Join Now
                </Link>
              </>
            ) : (
              <>
                Already a member?&nbsp;
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-hover font-medium cursor-pointer transition-colors"
                >
                  Login Now
                </Link>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
