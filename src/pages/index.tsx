import { type NextPage } from "next";
import Head from "next/head";

import { TopBar } from "@/components/TopBar";
import { Container, Text } from "@chakra-ui/react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Cowat</title>
        <meta
          name="description"
          content="Cowat - Profesionnal car sharing made easy"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TopBar />
      <Container>
        <Text>Nothing to see here yet</Text>
      </Container>
    </>
  );
};

export default Home;
