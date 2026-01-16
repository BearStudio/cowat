import { Code, Stack, Text } from "@chakra-ui/react";
import type { Events } from "@prisma/client";
import {
  EVENTS_DETAILS,
  EVENT_FIELDS_DESCRIPTIONS,
} from "@/utils/subscriptions";

type SubscriptionInfoProps = {
  event: Events;
};

export const SubscriptionInfo = ({ event }: SubscriptionInfoProps) => {
  const eventDetails = EVENTS_DETAILS[event];
  return (
    <Stack>
      <Text fontWeight="bold">{eventDetails.detail}</Text>
      <Text pt={4}>Query for this event should look like this:</Text>
      <Code>
        {"{"}
        <Stack>
          <Text pl="4">
            <span style={{ fontWeight: "bold" }}>event: </span>
            {`"${event}"`}
          </Text>
          {eventDetails.fields
            .filter((field) => field != "event")
            .map((field) => (
              <Text key={field} pl="4">
                <span style={{ fontWeight: "bold" }}>{field}: </span>
                {EVENT_FIELDS_DESCRIPTIONS[field].example}
              </Text>
            ))}
        </Stack>
        {"}"}
      </Code>
    </Stack>
  );
};
