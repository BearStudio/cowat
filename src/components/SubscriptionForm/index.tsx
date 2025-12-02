import {
  Alert,
  AlertDescription,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
} from "@chakra-ui/react";
import { FieldInput } from "@/components/FieldInput";
import { FieldSelect } from "@/components/FieldSelect";

import { Events } from "@prisma/client";
import { EVENTS_DETAILS, isValidEvent } from "@/utils/subscriptions";
import { useFormFields } from "@formiz/core";
import { z } from "zod";
import { SubscriptionInfo } from "@/components/SubscriptionForm/SubscriptionInfo";
import { Icon } from "@/components/Icon";
import { HelpCircleIcon } from "lucide-react";
import { SubscriptionHelper } from "@/components/SubscriptionForm/SubscriptionHelper";

export const SubscriptionForm = () => {
  const fields = useFormFields();
  const currentEvent = fields?.triggeringEvent?.value;
  return (
    <Stack>
      <HStack justify="flex-end" mb={-5}>
        <Popover>
          <PopoverTrigger>
            <IconButton
              variant="ghost"
              icon={<Icon icon={HelpCircleIcon} />}
              aria-label="webhook-details"
            />
          </PopoverTrigger>
          <PopoverContent>
            <PopoverCloseButton />
            <PopoverBody>
              <SubscriptionHelper />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      <FieldInput
        name="name"
        label="Name"
        placeholder="New subscription"
        required="Name is required"
      />
      <FieldSelect
        label="Event"
        name="triggeringEvent"
        placeholder="Please select an event"
        options={Object.values(Events).map((event) => ({
          value: event,
          label: EVENTS_DETAILS[event].label,
        }))}
        required="Event is required"
      />
      {isValidEvent(currentEvent) && (
        <Alert variant="infoGray" borderRadius="md">
          <AlertDescription>
            <SubscriptionInfo event={currentEvent} />
          </AlertDescription>
        </Alert>
      )}
      <FieldInput
        name="url"
        label="URL"
        placeholder="https://my.webhook.com/listener"
        required="URL is required"
        validations={[
          {
            handler: (value) => z.string().url().safeParse(value).success,
            message: "URL is not valid",
          },
        ]}
        pt="2"
      />
    </Stack>
  );
};
