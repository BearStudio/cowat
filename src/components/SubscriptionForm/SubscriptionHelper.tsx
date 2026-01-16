import { Stack, Text } from "@chakra-ui/react";

export const SubscriptionHelper = () => {
  return (
    <Stack>
      <Text fontWeight="bold">How to add a webhook</Text>
      <Text>
        To add a webhook, you must enter a name, select the event from the
        drop-down list (one webhook corresponds to a single event), and then
        specify the URL.
      </Text>
    </Stack>
  );
};
