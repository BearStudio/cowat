import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import theme from "@/theme";
import "@/config/dayjs";

import { api } from "../utils/api";

import { ChakraProvider } from "@chakra-ui/react";
import { useTimezone } from "@/components/Timezone";
import { EnvDevHint } from "@/components/EnvDevHint";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useTimezone();
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover"
        />
      </Head>
      <SessionProvider session={session}>
        <ChakraProvider theme={theme}>
          <EnvDevHint />
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </ChakraProvider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
