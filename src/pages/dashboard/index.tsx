import { CommuteOverview } from "@/components/CommuteOverview";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { FULL_TEXT_DATE, YEAR_MONTH_DAY } from "@/constants/dates";
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
import { Car, Navigation, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { Fragment } from "react";

const Dashboard = () => {
  const commutesByDate = api.commute.allUpcomingCommutes.useQuery();

  const days = Array.from(
    { length: commutesByDate.data?.numberOfDays ?? 0 },
    (_, i) => dayjs().add(i, "day").format(YEAR_MONTH_DAY)
  );

  return (
    <LayoutAuthenticated topBar={<Heading size="md">Cowat</Heading>}>
      <Head>
        <title>Cowat - Dashboard</title>
      </Head>
      {commutesByDate.isLoading && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}
      {commutesByDate.data?.commutes && (
        <Stack spacing="8">
          {days.map((day) => (
            <Day
              key={day}
              date={day}
              commutes={commutesByDate.data?.commutes?.[day] ?? []}
            />
          ))}
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

type UpcomingCommutes =
  RouterOutputs["commute"]["allUpcomingCommutes"]["commutes"];

type DayProps = {
  date: string;
  commutes?: UpcomingCommutes[keyof UpcomingCommutes][number][];
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
            passenger.requestStatus !== "CANCELED" &&
            passenger.requestStatus !== "REFUSED"
        )
      )
  );
  const otherCommutes = commutes?.filter(
    (commute) => !myCommutes?.map((c) => c.id).includes(commute.id)
  );

  return (
    <Stack>
      <HStack justifyContent="space-between">
        <Text fontSize="lg" fontWeight="bold">
          {date === dayjs().format(YEAR_MONTH_DAY)
            ? "Today"
            : dayjs(date).format(FULL_TEXT_DATE)}
        </Text>
        <Button
          as={Link}
          href={`/commutes/new?date=${dayjs(date).format("YYYY-MM-DD")}`}
          size="sm"
          leftIcon={<Plus size="1em" />}
          variant="link"
        >
          New Commute
        </Button>
      </HStack>
      {!myCommutes?.length && (
        <EmptyState
          as={!!otherCommutes?.length ? "button" : undefined}
          p={4}
          onClick={!!otherCommutes?.length ? onOpen : undefined}
        >
          {!otherCommutes?.length && <>No commute for this day</>}
          {!!otherCommutes?.length && (
            <>
              <HStack justifyContent="space-between">
                <Button
                  as="span"
                  variant="link"
                  leftIcon={<Car size="1.2em" />}
                >
                  See {otherCommutes?.length} commute
                  {otherCommutes?.length > 1 ? "s" : ""}
                </Button>
                <AvatarGroup max={5} size="sm" spacing={-2}>
                  {otherCommutes.map((commute) => (
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
            </>
          )}
        </EmptyState>
      )}
      {myCommutes?.map((commute) => (
        <Fragment key={commute.id}>
          <CommuteOverview {...commute} />
          {date === dayjs().format(YEAR_MONTH_DAY) && (
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Icon icon={Navigation} />}
              as={Link}
              href={`/dashboard/${
                commute.createdById === session?.user?.id
                  ? "driver"
                  : "passenger"
              }/${commute.id}`}
            >
              Open commute&apos;s view
            </Button>
          )}
        </Fragment>
      ))}

      {!!otherCommutes?.length && !!myCommutes?.length && (
        <Button
          onClick={onOpen}
          size="sm"
          variant="link"
          pt={2}
          leftIcon={<Car size="1.2em" />}
        >
          See {otherCommutes?.length} other commute
          {otherCommutes?.length > 1 ? "s" : ""}
        </Button>
      )}
      {isOpen && !!otherCommutes?.length && (
        <CommutesModal onClose={onClose} commutes={otherCommutes} date={date} />
      )}
    </Stack>
  );
};

type CommutesModalProps = {
  date: string;
  onClose: ModalProps["onClose"];
  commutes: UpcomingCommutes[keyof UpcomingCommutes][number][];
};

const CommutesModal = ({ onClose, commutes, date }: CommutesModalProps) => {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{dayjs(date).format(FULL_TEXT_DATE)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing="4">
            {commutes.map((commute) => (
              <CommuteOverview
                key={commute.id}
                {...commute}
                onBooked={onClose}
              />
            ))}
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Dashboard;
