import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import NextNProgress from "nextjs-progressbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";
import { StateProvider } from "../context/StateContext";
import reducer, { initialState } from "../context/StateReducer";
import { SessionProvider } from "next-auth/react";
import AIChatBot from "../components/AIChatBot";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <SessionProvider session={pageProps.session}>
      <StateProvider initialState={initialState} reducer={reducer}>
        <Head>
          <link rel="shortcut icon" href="/favicon.ico" />
          <title>ffiver</title>
        </Head>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            id="adsense-script"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        )}
        <NextNProgress stopDelayMs={20} />
        <ToastContainer />
        <div className="relative flex flex-col h-screen justify-between">
          <NavBar />
          <div
            className={`${
              router.pathname !== "/" ? "mt-32" : ""
            } mb-auto w-full mx-auto`}
          ></div>
          <div className="mb-auto w-full mx-auto">
            <Component {...pageProps} />
          </div>
          <Footer />
          <AIChatBot />
        </div>
      </StateProvider>
    </SessionProvider>
  );
}
