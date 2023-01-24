import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";

export type CommuteOverviewProps = Prisma.CommuteGetPayload<{
  include: { createdBy: true; stops: { include: { location: true } } };
}>;

export const CommuteOverview = (props: CommuteOverviewProps) => {
  return (
    <Card boxShadow="card">
      <CardHeader pb={0}>
        <HStack>
          <Avatar
            size="sm"
            name={props.createdBy?.name ?? ""}
            src={props.createdBy?.image ?? ""}
          />
          <Stack spacing={0}>
            <Text fontSize="sm" fontWeight="bold">
              {dayjs(props.date).format("dddd DD MMMM YYYY")}
            </Text>
            <Text fontSize="sm">
              {props.createdBy?.name ?? props.createdBy?.email}
            </Text>
          </Stack>
        </HStack>
      </CardHeader>
      <CardBody pt={2}>
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton p={0} _hover={{ bg: "none" }}>
              <AccordionIcon />
              {props.stops.length} stop{props.stops.length > 1 ? "s" : ""} ·{" "}
              {props.seats} seat{props.seats > 1 ? "s" : ""}
            </AccordionButton>
            <AccordionPanel p={0}>
              <Stack divider={<StackDivider />} spacing="4">
                <StackDivider />
                {props.stops.map((stop) => (
                  <Stack key={stop.id} spacing={0}>
                    <Text fontSize="sm" fontWeight="bold">
                      {stop?.location?.name}
                    </Text>
                    <Text fontSize="sm">{stop?.location?.address}</Text>
                  </Stack>
                ))}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};
