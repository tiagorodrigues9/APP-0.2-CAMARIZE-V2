import "@/styles/globals.css";
import { RegisterProvider } from "@/context/RegisterContext";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <RegisterProvider>
        <Component {...pageProps} />
      </RegisterProvider>
    </>
  );
}
