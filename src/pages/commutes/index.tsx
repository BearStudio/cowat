import { TopBar } from "@/components/TopBar";
import { api } from "@/utils/api";
import { Button, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";
import { Fragment } from "react";

const CommutesIndex: NextPage = () => {
  const myCommutes = api.commute.myCommute.useQuery();

  return (
    <div>
      <TopBar />
      <Heading>Commute</Heading>
      <Button as={Link} href="/commutes/new" colorScheme="brand">
        New Commute
      </Button>

      {myCommutes.isLoading && <div>Loader</div>}
      {!myCommutes.isLoading && (
        <ul>
          {myCommutes.data?.map((commute) => (
            <Fragment key={commute.id}>
              <p>
                {commute.id} - {commute.seats} - {commute.status}
              </p>
              <div>
                {commute.stops.map((stop) => (
                  <div key={stop.location?.id}>{stop.location?.address}</div>
                ))}
              </div>
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommutesIndex;
