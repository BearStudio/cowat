import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { EventQueryFieldsHelper } from "@/components/SubscriptionForm";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api, RouterOutputs } from "@/utils/api";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { ArrowLeft, Plus, Info, Edit, Trash } from "lucide-react";
import Link from "next/link";

const SubscriptionsPage = () => {
  const ctx = api.useContext();

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
          <EmptyState>
            Une erreur est survenue lors de la récupération des webhooks.
          </EmptyState>
        )}
        {!subscriptionsQuery?.isLoading &&
          !subscriptionsQuery?.isError &&
          subscriptionsQuery?.data?.length == 0 && (
            <EmptyState>{"Vous n'avez aucun webhook enregistré."}</EmptyState>
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
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{subscription.name}</Heading>
      </CardHeader>
      <CardBody>
        <Stack>
          <HStack>
            <Text>{subscription.triggeringEvent}</Text>
            <Tooltip
              label={
                <Stack>
                  <Text>
                    Query for this event will contains the following fields:
                  </Text>
                  <EventQueryFieldsHelper
                    event={subscription.triggeringEvent}
                  />
                </Stack>
              }
            >
              <Icon icon={Info} />
            </Tooltip>
          </HStack>
          <Text color="gray.500">{subscription.url}</Text>
        </Stack>
      </CardBody>
      <CardFooter justifyContent="flex-end">
        <HStack>
          <IconButton
            icon={<Icon icon={Edit} />}
            aria-label="Edit subscription"
          />
          <IconButton
            variant="danger"
            icon={<Icon icon={Trash} />}
            aria-label="Delete subscription"
          />
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionsPage;
