import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Button, Flex, Heading, Stack } from "@chakra-ui/react";
import type { NextPage } from "next";
import NextLink from "next/link";
import { FiPlus } from "react-icons/fi";

const CommutesIndex: NextPage = () => {
  const myCommutes = api.commute.myCommute.useQuery();

  return (
    <LayoutAuthenticated>
      <Flex justify="space-between">
        <Heading size="lg">My Commutes</Heading>
        <Button
          as={NextLink}
          href="/commutes/new"
          leftIcon={<Icon icon={FiPlus} />}
        >
          Create
        </Button>
      </Flex>

      {myCommutes.isLoading && <div>Loader</div>}
      {!myCommutes.isLoading &&
        myCommutes.data?.map((commute) => (
          <Stack key={commute.id}>
            <Button
              as={NextLink}
              href={`/commutes/${commute.id}`}
              variant="link"
            >
              {commute.id} - {commute.seats} - {commute.status}
            </Button>

            <div>
              {commute.stops.map((stop) => (
                <div key={stop.location?.id}>{stop.location?.address}</div>
              ))}
            </div>
          </Stack>
        ))}
    </LayoutAuthenticated>
  );
};

export default CommutesIndex;
