import { CommuteOverview } from "@/components/CommuteOverview";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Flex, Heading, IconButton, Skeleton, Stack } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import type { NextPage } from "next";
import NextLink from "next/link";

const CommutesIndex: NextPage = () => {
  const myCommutes = api.commute.myCommute.useQuery();
  const communityCommutes = api.commute.communityCommutes.useQuery();

  return (
    <LayoutAuthenticated
      topBar={
        <Flex justify="space-between">
          <Heading>Commutes</Heading>
          <IconButton
            variant="primary"
            aria-label="Create commute"
            icon={<Icon icon={Plus} />}
            as={NextLink}
            href="/commutes/new"
          />
        </Flex>
      }
    >
      <Stack spacing="16">
        {myCommutes.isLoading && <Skeleton height="8.5rem" />}
        {!myCommutes.isLoading && (
          <Stack spacing="4">
            {myCommutes.data?.length === 0 && (
              <EmptyState>You have no commute at the moment</EmptyState>
            )}
            {myCommutes.data?.map((commute) => (
              <CommuteOverview key={commute.id} {...commute} />
            ))}
          </Stack>
        )}

        {communityCommutes.isLoading && <Skeleton height="8.5rem" />}
        {!communityCommutes.isLoading && (
          <Stack spacing="4">
            <Flex justify="space-between">
              <Heading size="lg">Community Commutes</Heading>
            </Flex>
            {communityCommutes.data?.length === 0 && (
              <EmptyState>No community commutes at the moment</EmptyState>
            )}
            {communityCommutes.data?.map((commute) => (
              <CommuteOverview key={commute.id} {...commute} />
            ))}
          </Stack>
        )}
      </Stack>
    </LayoutAuthenticated>
  );
};

export default CommutesIndex;
