import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { SimpleCard } from "@/components/SimpleCard";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api, RouterOutputs } from "@/utils/api";
import {
  Box,
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
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { FC } from "react";

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
            <SimpleGrid>
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
  subscription: RouterOutputs["subscription"]["mine"][number]; //TODO: typing
};

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <Heading size="md">{subscription.name}</Heading>
      </CardHeader>
      <CardBody>
        <Stack>
          {/* <Tooltip></Tooltip> */}
          <Text>{subscription.triggeringEvent}</Text>
          <Text color="gray.500">{subscription.url}</Text>
        </Stack>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default SubscriptionsPage;
