import { CommuteForm } from "@/components/CommuteForm";
import { Icon } from "@/components/Icon";
import { Loader } from "@/components/Loader";
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

type EditCommuteTemplateInput = RouterInputs["template"]["edit"];

type EditCommuteTemplateValues = Omit<
  EditCommuteTemplateInput,
  "commuteType"
> & {
  commuteType: boolean;
};

const EditCommuteTemplates: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { id } = router.query;

  const template = api.template.get.useQuery(
    { id: id?.toString() ?? "" },
    {
      enabled: !!id,
    }
  );

  const commuteTemplateMutation = api.template.edit.useMutation({
    onSuccess: () => {
      router.push("/account/commute-templates");
    },
  });

  const handleOnValidSubmit = (values: EditCommuteTemplateValues) => {
    commuteTemplateMutation.mutate(
      {
        ...values,
        id: id?.toString() ?? "",
        commuteType: values.commuteType ? "ROUND" : "ONEWAY",
      },
      {
        onSuccess: () => {
          ctx.template.invalidate();
        },
      }
    );
  };

  const stops = template.data
    ? template.data.stops.map((stop) => ({
        ...stop,
        location: stop.location.id,
      }))
    : [];

  const defaultValues = {
    ...template.data,
    stops,
    commuteType:
      template.data?.commuteType === "ROUND" ||
      template.data?.commuteType === undefined,
  };

  const editCommuteForm = useForm({
    initialValues: defaultValues,
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
          <Heading size="md">Edit Commute Template</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - Edit Commute Template</title>
      </Head>
      {template.isLoading && <Loader />}
      {!template.isLoading && defaultValues && (
        <Formiz autoForm connect={editCommuteForm}>
          <SimpleCard>
            <CommuteForm
              repeaterInitialValues={defaultValues.stops}
              mode="TEMPLATE"
            />
            <Button
              variant="primary"
              type="submit"
              isLoading={commuteTemplateMutation.isLoading}
            >
              Save
            </Button>
          </SimpleCard>
        </Formiz>
      )}
    </LayoutAuthenticated>
  );
};

export default EditCommuteTemplates;
