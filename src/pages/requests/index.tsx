import { EmptyState } from "@/components/EmptyState";
import { Request } from "@/components/Request";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Heading, Skeleton, Stack } from "@chakra-ui/react";
import Head from "next/head";

const RequestsPage = () => {
  const requests = api.commute.allRequestsForMyCommute.useQuery();

  return (
    <LayoutAuthenticated topBar={<Heading size="md">Requests</Heading>}>
      <Head>
        <title>Cowat - Requests</title>
      </Head>
      <Stack>
        {requests.isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} rounded="md" height="3rem" />
          ))}

        {requests.data?.length === 0 && (
          <EmptyState>You have no request at the moment</EmptyState>
        )}

        {requests.data?.map((request) => (
          <Request
            key={`${request.stopId}-${request.userId}`}
            request={request}
          />
        ))}
      </Stack>
    </LayoutAuthenticated>
  );
};

export default RequestsPage;
