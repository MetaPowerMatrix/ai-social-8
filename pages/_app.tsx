import "@/styles/global.css";
import type { AppProps } from "next/app";
import CommandDataContainer from "@/container/command";
import {NextIntlClientProvider} from 'next-intl';
import {useRouter} from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider
      locale={"zh-CN"}
      timeZone="Asia/Hong_Kong"
      messages={pageProps.messages}
    >
      <CommandDataContainer.Provider>
        <Component {...pageProps} />
      </CommandDataContainer.Provider>
    </NextIntlClientProvider>
  );
}
