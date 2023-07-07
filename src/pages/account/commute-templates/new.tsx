import { CommuteForm } from "@/components/CommuteForm";
import { Icon } from "@/components/Icon";
import { SimpleCard } from "@/components/SimpleCard";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import { Formiz, useForm } from "@formiz/core";
import { ArrowLeft } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

type CreateCommuteTemplateInput =
  RouterInputs["template"]["createCommuteTemplate"];

const NewCommuteTemplates: NextPage = () => {
  const router = useRouter();

  const commuteTemplateMutation =
    api.template.createCommuteTemplate.useMutation({
      onSuccess: () => {
        router.push("/account/commute-templates");
      },
    });

  const handleOnValidSubmit = (values: CreateCommuteTemplateInput) => {
    commuteTemplateMutation.mutate(values);
  };

  const form = useForm({
    onValidSubmit: handleOnValidSubmit,
  });

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
            href="/account/commute-templates"
          />
          <Heading size="md">New Commute Template</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - New Commute Template</title>
      </Head>
      <Formiz autoForm connect={form}>
        <SimpleCard>
          <CommuteForm mode="TEMPLATE" />
          <Button
            variant="primary"
            type="submit"
            isLoading={commuteTemplateMutation.isLoading}
          >
            Save
          </Button>
        </SimpleCard>
      </Formiz>
    </LayoutAuthenticated>
  );
};

export default NewCommuteTemplates;
