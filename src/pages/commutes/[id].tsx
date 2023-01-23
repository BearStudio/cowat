import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Box, CircularProgress, Heading, Stack, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";

const CommutesIndex: NextPage = () => {
  const { query } = useRouter();

  const id = query.id ? query.id.toString() : "";

  const commute = api.commute.commute.useQuery(
    { id },
    {
      enabled: !!id,
    }
  );

  return (
    <LayoutAuthenticated>
      <Heading>Commute Details</Heading>
      {commute.isLoading && <CircularProgress isIndeterminate />}
      {!commute?.isLoading && (
        <Stack>
          <Box>
            <Text>Nombre de places disponible: {commute.data?.seats}</Text>
          </Box>
          {commute.data?.stops?.map((stop) => (
            <Box key={stop.id}>
              {stop.location?.name} - {stop.location?.address}
              <br />
              Passengers:{" "}
              {stop.passengers
                .map((passenger) => passenger.user.email)
                .join(", ")}
            </Box>
          ))}
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

export default CommutesIndex;
