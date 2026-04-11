import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useStateProvider } from "../../context/StateContext";
import { reducerCases } from "../../context/constants";
import { OAUTH_GOOGLE_ROUTE } from "../../utils/constants";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [, setCookies] = useCookies();
  const [, dispatch] = useStateProvider();
  const authCookieOptions = {
    path: "/",
    maxAge: 3 * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };

  useEffect(() => {
    const finishGoogleAuth = async () => {
      if (status !== "authenticated" || !session?.user?.email) return;

      try {
        const {
          data: { user, jwt },
        } = await axios.post(OAUTH_GOOGLE_ROUTE, {
          email: session.user.email,
          name: session.user.name || "",
        });

        setCookies("jwt", jwt, authCookieOptions);
        dispatch({ type: reducerCases.SET_USER, userInfo: user });
        dispatch({ type: reducerCases.CLOSE_AUTH_MODAL });
        router.replace("/");
      } catch (err) {
        router.replace("/");
      }
    };

    finishGoogleAuth();
  }, [status, session, dispatch, router, setCookies]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <p className="text-sm text-zinc-400">Signing you in with Google...</p>
    </div>
  );
};

export default GoogleCallbackPage;

