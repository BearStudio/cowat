import { type NextPage } from "next";
import Head from "next/head";

import { Text } from "@chakra-ui/react";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

const Home: NextPage = () => {
  return (
    <LayoutAuthenticated>
      <Head>
        <title>Cowat</title>
        <meta
          name="description"
          content="Cowat - Profesionnal car sharing made easy"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Text>Nothing to see here yet</Text>
    </LayoutAuthenticated>
  );
};

export default Home;
