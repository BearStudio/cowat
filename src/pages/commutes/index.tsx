import { CommuteOverview } from "@/components/CommuteOverview";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Heading, HStack, IconButton, Stack } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import type { NextPage } from "next";
import NextLink from "next/link";

const CommutesIndex: NextPage = () => {
  const commutes = api.commute.allMyCommutes.useQuery();

  return (
    <LayoutAuthenticated
      topBar={
        <HStack justify="space-between">
          <Heading size="md">My Commutes</Heading>
          <IconButton
            variant="primary"
            size="sm"
            aria-label="Create commute"
            icon={<Icon icon={Plus} />}
            as={NextLink}
            href="/commutes/new"
          />
        </HStack>
      }
    >
      {commutes.data?.length === 0 && (
        <EmptyState>No commute available</EmptyState>
      )}
      <Stack spacing="4">
        {commutes.data?.map((commute) => (
          <CommuteOverview key={commute.id} {...commute} />
        ))}
      </Stack>
    </LayoutAuthenticated>
  );
};

export default CommutesIndex;
