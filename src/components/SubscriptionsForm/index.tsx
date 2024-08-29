import type { RouterOutputs } from "@/utils/api";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import { useForm, useRepeater } from "@formiz/core";
import { AddPlaceholder } from "@/components/AddPlaceholder";
import { Icon } from "@/components/Icon";
import { Plus } from "lucide-react";
import { SubscriptionForm } from "@/components/SubscriptionForm";

type Subscription =
  RouterOutputs["subscription"]["getAllSubscriptionsByUser"][number];

type SubscriptionsFormProps = {
  initialValues: Array<Subscription>;
};

export const SubscriptionsForm = ({
  initialValues,
}: SubscriptionsFormProps) => {
  const form = useForm();
  const subscriptions = useRepeater({
    name: "subscriptions",
    connect: form,
    initialValues,
  });
  return (
    <Accordion allowMultiple>
      {subscriptions.keys.map((key, index) => {
        const subscriptionIndex = Number.isInteger(parseInt(key))
          ? parseInt(key)
          : index;
        return (
          <AccordionItem key={key}>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {initialValues[subscriptionIndex]?.name ?? "New subscription"}
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <SubscriptionForm
                id={initialValues[subscriptionIndex]?.id}
                index={index}
                onRemove={() => subscriptions.remove(index)}
              />
            </AccordionPanel>
          </AccordionItem>
        );
      })}
      <AddPlaceholder mt="2" onClick={() => subscriptions.append()}>
        <Icon icon={Plus} /> Add Subscription
      </AddPlaceholder>
    </Accordion>
  );
};
