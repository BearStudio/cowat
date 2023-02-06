import { CommuteOverview } from "@/components/CommuteOverview";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import type { ModalProps } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";
import {
  Avatar,
  AvatarGroup,
  Button,
  Center,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { Car, Navigation } from "lucide-react";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const commutesByDate = api.commute.allUpcomingCommutes.useQuery();

  return (
    <LayoutAuthenticated topBar={<Heading size="md">Cowat</Heading>}>
      {commutesByDate.isLoading && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}
      <Stack spacing="8">
        {commutesByDate.data &&
          Object.keys(commutesByDate.data).map((key) => (
            <Day key={key} date={key} commutes={commutesByDate.data?.[key]} />
          ))}
      </Stack>
    </LayoutAuthenticated>
  );
};

type DayProps = {
  date: string;
  commutes?: RouterOutputs["commute"]["allUpcomingCommutes"][keyof RouterOutputs["commute"]["allUpcomingCommutes"]];
};

const Day = ({ date, commutes }: DayProps) => {
  const { data: session } = useSession();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const myCommutes = commutes?.filter(
    (commute) =>
      commute.createdById === session?.user?.id ||
      commute.stops.some((stop) =>
        stop.passengers.some(
          (passenger) =>
            passenger.userId === session?.user?.id &&
            passenger.requestStatus !== "CANCELED"
        )
      )
  );
  return (
    <Stack>
      <Text fontSize="lg" fontWeight="bold">
        {date === dayjs().format("YYYY-MM-DD")
          ? "Today"
          : dayjs(date).format("dddd DD MMM")}
      </Text>
      {!myCommutes?.length && (
        <EmptyState
          as={!!commutes?.length ? "button" : undefined}
          p={4}
          onClick={!!commutes?.length ? onOpen : undefined}
        >
          {!commutes?.length && <>No commute for this day</>}
          {!!commutes?.length && (
            <>
              <HStack justifyContent="space-between">
                <Button
                  as="span"
                  variant="link"
                  leftIcon={<Car size="1.2em" />}
                >
                  See {commutes?.length} commute
                  {commutes?.length > 1 ? "s" : ""}
                </Button>
                <AvatarGroup max={5} size="sm" spacing={-2}>
                  {commutes.map((commute) => (
                    <Avatar
                      key={commute.id}
                      borderRadius="md"
                      src={commute.createdBy?.image ?? undefined}
                      name={
                        commute.createdBy?.name ??
                        commute.createdBy?.email ??
                        ""
                      }
                    />
                  ))}
                </AvatarGroup>
              </HStack>
              {isOpen && (
                <CommutesModal
                  onClose={onClose}
                  commutes={commutes}
                  date={date}
                />
              )}
            </>
          )}
        </EmptyState>
      )}
      {myCommutes?.map((commute) => (
        <CommuteOverview key={commute.id} {...commute} />
      ))}
      {date === dayjs().format("YYYY-MM-DD") && (
        <Button
          variant="primary"
          size="lg"
          leftIcon={<Icon icon={Navigation} />}
          isDisabled
        >
          Open commute&apos;s view
        </Button>
      )}
    </Stack>
  );
};

type CommutesModalProps = {
  date: string;
  onClose: ModalProps["onClose"];
  commutes: RouterOutputs["commute"]["allUpcomingCommutes"][keyof RouterOutputs["commute"]["allUpcomingCommutes"]];
};

const CommutesModal = ({ onClose, commutes, date }: CommutesModalProps) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{dayjs(date).format("dddd DD MMM")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {commutes.map((commute) => (
            <CommuteOverview key={commute.id} {...commute} onBooked={onClose} />
          ))}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Dashboard;
