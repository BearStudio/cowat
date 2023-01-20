import { TopBar } from "@/components/TopBar";
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
    <>
      <TopBar />
      <Heading>Commute Details</Heading>
      {commute.isLoading && <CircularProgress isIndeterminate />}
      {!commute?.isLoading && (
        <Stack>
          <Box>
            <Text>Nombre de places disponible: {commute.data?.seats}</Text>
          </Box>
        </Stack>
      )}
    </>
  );
};

export default CommutesIndex;
