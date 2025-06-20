import { ConfirmModal } from "@/components/ConfirmModal";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import { SubscriptionHelper } from "@/components/SubscriptionForm/SubscriptionHelper";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { EVENTS_DETAILS } from "@/utils/subscriptions";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Formiz, useForm } from "@formiz/core";
import { ArrowLeft, Plus, Info, Trash, Pencil, Webhook } from "lucide-react";
import Link from "next/link";

const SubscriptionsPage = () => {
  const subscriptionsQuery = api.subscription.mine.useQuery();

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            as={Link}
            href="/account"
          />
          <Heading size="md" flex={1}>
            Subscriptions
          </Heading>
          <IconButton
            size="sm"
            variant="primary"
            aria-label="Create location"
            icon={<Icon icon={Plus} />}
            as={Link}
            href="/account/subscriptions/new"
          />
        </HStack>
      }
    >
      <>
        {subscriptionsQuery?.isLoading && <Spinner />}
        {!subscriptionsQuery?.isLoading && subscriptionsQuery?.isError && (
          <EmptyState>An error occured when fetching webhooks.</EmptyState>
        )}
        {!subscriptionsQuery?.isLoading &&
          !subscriptionsQuery?.isError &&
          subscriptionsQuery?.data?.length == 0 && (
            <EmptyState>You have no webhook active.</EmptyState>
          )}
        {!subscriptionsQuery?.isLoading &&
          !subscriptionsQuery?.isError &&
          subscriptionsQuery?.data?.length > 0 && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
              {subscriptionsQuery?.data.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                />
              ))}
            </SimpleGrid>
          )}
      </>
    </LayoutAuthenticated>
  );
};

type SubscriptionCardProps = {
  subscription: RouterOutputs["subscription"]["mine"][number];
};

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const ctx = api.useContext();

  const updateSubscriptionModal = useDisclosure();

  const updateSubscriptionForm = useForm({
    onValidSubmit: (values) =>
      updateSubscription.mutate({ ...values, id: subscription.id }),
    initialValues: subscription,
  });

  const updateSubscription = api.subscription.edit.useMutation({
    onSuccess: () => {
      updateSubscriptionModal.onClose();
      ctx.subscription.mine.invalidate();
    },
  });

  const deleteSubscription = api.subscription.delete.useMutation({
    onSuccess: () => {
      ctx.subscription.mine.invalidate();
    },
  });

  return (
    <Card>
      <CardHeader>
        <Heading size="md">{subscription.name}</Heading>
      </CardHeader>
      <CardBody>
        <Stack>
          <HStack>
            <Text>{EVENTS_DETAILS[subscription.triggeringEvent].label}</Text>
            <Popover>
              <PopoverTrigger>
                <IconButton
                  variant="ghost"
                  icon={<Icon icon={Info} />}
                  aria-label="event-details"
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody>
                  <SubscriptionHelper event={subscription.triggeringEvent} />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </HStack>
          <Text color="gray.500">{subscription.url}</Text>
        </Stack>
      </CardBody>
      <CardFooter justifyContent="flex-end">
        <HStack>
          <IconButton
            icon={<Icon icon={Pencil} />}
            aria-label="Edit subscription"
            onClick={updateSubscriptionModal.onOpen}
          />
          <ConfirmModal
            onConfirm={() => deleteSubscription.mutate(subscription.id)}
            title="Delete this subscription?"
            message={
              <Stack pt={2}>
                <Divider />
                <HStack>
                  <Icon icon={Webhook} />
                  <Stack spacing={0}>
                    <Text fontWeight="bold">{subscription.name}</Text>
                    <Text fontSize="sm" wordBreak="break-word">
                      {subscription.triggeringEvent}
                    </Text>
                    <Text fontSize="sm" color="gray.500" wordBreak="break-word">
                      {subscription.url}
                    </Text>
                  </Stack>
                </HStack>
                <Divider />
              </Stack>
            }
            confirmText="Delete"
            confirmVariant="danger"
          >
            <IconButton
              variant="danger"
              icon={<Icon icon={Trash} />}
              aria-label="Delete subscription"
            />
          </ConfirmModal>
        </HStack>
      </CardFooter>
      {updateSubscriptionModal.isOpen && (
        <Modal isOpen onClose={updateSubscriptionModal.onClose} size="lg">
          <ModalOverlay />
          <Formiz autoForm connect={updateSubscriptionForm}>
            <ModalContent>
              <ModalHeader flex="1">Edit subscription</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <SubscriptionForm />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="primary"
                  onClick={() => updateSubscriptionForm.submit()}
                  isDisabled={
                    updateSubscriptionForm.isSubmitted &&
                    !updateSubscriptionForm.isValid
                  }
                  isLoading={updateSubscription.isLoading}
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Formiz>
        </Modal>
      )}
    </Card>
  );
};

export default SubscriptionsPage;
