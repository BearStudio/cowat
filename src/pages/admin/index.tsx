import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  HStack,
  Spinner,
  Stack,
  StackDivider,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

const AdminPage = () => {
  const stats = api.admin.getStats.useQuery();

  return (
    <LayoutAuthenticated
      topBar={<Heading size="md">Admin</Heading>}
      access="ADMIN"
      containerSize="full"
    >
      {stats.isLoading && (
        <Center flex="1">
          <Spinner />
        </Center>
      )}
      {!stats.isLoading && stats.data && (
        <Stack>
          <HStack>
            <Card>
              <CardHeader>
                <Heading>Commutes</Heading>
              </CardHeader>
              <CardBody>
                <Stack divider={<StackDivider />} spacing="4">
                  <Stat>
                    <StatLabel>Number of Commutes</StatLabel>
                    <StatNumber>{stats.data.numberOfCommutesTotal}</StatNumber>
                    <StatHelpText>All time</StatHelpText>
                  </Stat>
                  <Stack direction={{ base: "column", md: "row" }}>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th isNumeric>Commutes as Driver</Th>
                          </Tr>
                          {stats.data.numberOfCommuteAsDriverPerUsers.map(
                            (numberOfCommutePerUser) => (
                              <Tr key={numberOfCommutePerUser.id}>
                                <Td>{numberOfCommutePerUser.name}</Td>
                                <Td isNumeric>
                                  {numberOfCommutePerUser._count.commutes}
                                </Td>
                              </Tr>
                            )
                          )}
                        </Thead>
                      </Table>
                    </TableContainer>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Name</Th>
                            <Th isNumeric>Commutes as Passenger</Th>
                          </Tr>
                          {stats.data.numberOfCommuteAsPassengerPerUsers.map(
                            (numberOfCommuteAsPassengerPerUser) => (
                              <Tr key={numberOfCommuteAsPassengerPerUser.id}>
                                <Td>
                                  {numberOfCommuteAsPassengerPerUser.name}
                                </Td>
                                <Td isNumeric>
                                  {numberOfCommuteAsPassengerPerUser.countPassenger?.toString() ??
                                    0}
                                </Td>
                              </Tr>
                            )
                          )}
                        </Thead>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </HStack>
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

// numberOfCommuteAsPassengerPerUsers

export default AdminPage;
