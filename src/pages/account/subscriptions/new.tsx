import { SimpleCard } from "@/components/SimpleCard";
import { Icon } from "@/components/Icon";
import { LocationForm } from "@/components/LocationForm";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import { ArrowLeft } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { SubscriptionForm } from "@/components/SubscriptionForm";

const Locations: NextPage = () => {
  const router = useRouter();

  //TODO: typing
  const handleOnValidSubmit = (values: any) => {
    // TODO: add subscription
  };

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
            href="/account/subscriptions"
          />
          <Heading size="md">New Subscription</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - New Subscription</title>
      </Head>
      <Formiz autoForm onValidSubmit={handleOnValidSubmit}>
        <SimpleCard>
          <SubscriptionForm />
          <Button variant="primary" type="submit">
            Save
          </Button>
        </SimpleCard>
      </Formiz>
    </LayoutAuthenticated>
  );
};

export default Locations;
