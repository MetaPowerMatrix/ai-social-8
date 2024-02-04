import "@/styles/global.css";
import type { AppProps } from "next/app";
import CommandDataContainer from "@/container/command";

export default function App({ Component, pageProps }: AppProps) {
  return <CommandDataContainer.Provider><Component {...pageProps} /></CommandDataContainer.Provider>;
}
