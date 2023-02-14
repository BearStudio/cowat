import { Icon } from "@/components/Icon";
import { FULL_TEXT_DATE_WITH_TIME } from "@/constants/dates";
import { api } from "@/utils/api";
import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
import type {
  Commute,
  Location,
  PassengersOnStops,
  Stop,
  User,
} from "@prisma/client";
import { RequestStatus } from "@prisma/client";
import { dayjsTz } from "@/utils/dayjs";
import { Check, X } from "lucide-react";

type RequestProps = {
  request: PassengersOnStops & {
    stop: Stop & {
      location: Location | null;
      commute: Commute | null;
    };
    user: User;
  };
};

export const Request = ({ request }: RequestProps) => {
  const ctx = api.useContext();

  const updateRequestStatus = api.stop.requestStatus.useMutation({
    onSuccess: () => {
      ctx.commute.invalidate();
      ctx.stop.invalidate();
    },
  });

  return (
    <Stack shadow="lg" bg="white" rounded="md" p="4">
      <Flex justify="space-between" align="center">
        <Stack spacing="0">
          <Text color="gray.900" fontWeight="bold">
            Request from {request.user.name ?? request.user.email}
          </Text>
          <Text fontSize="sm">
            <>
              For{" "}
              <Text as="span" fontWeight="bold">
                {dayjsTz(request.stop.commute?.date).format(
                  FULL_TEXT_DATE_WITH_TIME
                )}
              </Text>{" "}
              commute
            </>
          </Text>
          <Text fontSize="xs">
            📍 {request.stop.time} · {request.stop.location?.name}
          </Text>
        </Stack>
        <Avatar
          src={request.user.image ?? ""}
          name={request.user.name ?? request.user.email ?? ""}
        />
      </Flex>
      <Flex gap="3">
        <Button
          w="full"
          variant="primary"
          leftIcon={<Icon icon={Check} />}
          isLoading={updateRequestStatus.isLoading}
          onClick={() =>
            updateRequestStatus.mutate({
              passengerId: request.userId,
              requestStatus: RequestStatus.ACCEPTED,
              stopId: request.stopId,
            })
          }
        >
          Accept
        </Button>
        <Button
          w="full"
          variant="danger"
          leftIcon={<Icon icon={X} />}
          isLoading={updateRequestStatus.isLoading}
          onClick={() =>
            updateRequestStatus.mutate({
              passengerId: request.userId,
              requestStatus: RequestStatus.REFUSED,
              stopId: request.stopId,
            })
          }
        >
          Refuse
        </Button>
      </Flex>
    </Stack>
  );
};
