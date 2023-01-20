import { TopBar } from "@/components/TopBar";
import { api } from "@/utils/api";
import { Button, Container, Heading, Stack } from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";

const CommutesIndex: NextPage = () => {
  const myCommutes = api.commute.myCommute.useQuery();

  return (
    <div>
      <TopBar />

      <Container>
        <Heading>Commute</Heading>
        <Button as={Link} href="/commutes/new" colorScheme="brand">
          New Commute
        </Button>

        {myCommutes.isLoading && <div>Loader</div>}
        {!myCommutes.isLoading &&
          myCommutes.data?.map((commute) => (
            <Stack key={commute.id}>
              <Button as={Link} href={`/commutes/${commute.id}`} variant="link">
                {commute.id} - {commute.seats} - {commute.status}
              </Button>

              <div>
                {commute.stops.map((stop) => (
                  <div key={stop.location?.id}>{stop.location?.address}</div>
                ))}
              </div>
            </Stack>
          ))}
      </Container>
    </div>
  );
};

export default CommutesIndex;
