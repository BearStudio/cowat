import { Icon } from "@/components/Icon";
import { Loader } from "@/components/Loader";
import { SimpleCard } from "@/components/SimpleCard";
import SubscriptionsForm from "@/components/SubscriptionsForm";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Formiz } from "@formiz/core";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

type EditSubscriptionsInput = RouterInputs["subscription"]["edit"];

const EditSubscriptions: NextPage = () => {
  const ctx = api.useContext();

  const subscriptionsQuery =
    api.subscription.getAllSubscriptionsByUser.useQuery();

  const subscriptionMutation = api.subscription.edit.useMutation();

  const handleOnValidSubmit = (values: EditSubscriptionsInput) => {
    subscriptionMutation.mutate(
      { subscriptions: values.subscriptions ?? [] },
      {
        onSuccess: () => {
          ctx.subscription.getAllSubscriptionsByUser.invalidate();
        },
      }
    );
  };

  const initialValues = { subscriptions: subscriptionsQuery.data ?? [] };

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
          <Heading size="md">Edit Subscriptions</Heading>
        </HStack>
      }
    >
      <>
        <Head>
          <title>Cowat - Edit Subscriptions</title>
        </Head>
        {subscriptionsQuery.isLoading && <Loader />}
        {!subscriptionsQuery.isLoading && initialValues && (
          <Formiz
            autoForm
            initialValues={initialValues}
            onValidSubmit={handleOnValidSubmit}
          >
            <SimpleCard>
              <>
                <SubscriptionsForm
                  initialValues={initialValues.subscriptions}
                />
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={subscriptionMutation.isLoading}
                >
                  Save
                </Button>
              </>
            </SimpleCard>
          </Formiz>
        )}
      </>
    </LayoutAuthenticated>
  );
};

export default EditSubscriptions;
