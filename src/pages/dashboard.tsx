import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import { Box, Heading, Text } from "@chakra-ui/react";

const Dashboard = () => {
  const requests = api.commute.allRequestsForMyCommute.useQuery();

  return (
    <LayoutAuthenticated topBar={<Heading>Dashboard</Heading>}>
      {requests.data?.map((request) => (
        <Box key={`${request.stopId}-${request.userId}`}>
          <Text>{request.stop.commute?.date.toISOString()}</Text>
          <Text>{request.user.name ?? request.user.email}</Text>
        </Box>
      ))}
    </LayoutAuthenticated>
  );
};

export default Dashboard;
