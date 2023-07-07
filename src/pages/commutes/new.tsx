import type { NextPage } from "next";
import { Formiz, useForm } from "@formiz/core";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import {
  Button,
  Card,
  CardBody,
  Center,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Icon } from "@/components/Icon";
import { ArrowLeft } from "lucide-react";

import dayjs from "dayjs";
import { DAY_MONTH_YEAR } from "@/constants/dates";
import { CommuteForm } from "@/components/CommuteForm";
import { useEffect, useState } from "react";
import { CommuteTemplateOverview } from "@/components/CommuteTemplateOverview";
import Head from "next/head";
import { SimpleCard } from "@/components/SimpleCard";

type CreateCommuteInput = RouterInputs["commute"]["createCommute"];

const FROM_SCRATCH = "FROM_SCRATCH";

const New: NextPage = () => {
  const router = useRouter();
  const { date: dateQueryParam, template: templateQueryParam } = router.query;

  const [selectedTemplate, setSelectedTemplate] = useState<
    string | undefined | typeof FROM_SCRATCH
  >(undefined);

  // Need to react to the params changes.
  useEffect(() => {
    setSelectedTemplate(templateQueryParam?.toString());
  }, [templateQueryParam]);

  type FormValues = Omit<CreateCommuteInput, "date"> & { date: string };

  const handleOnValidSubmit = (values: FormValues) => {
    const { date, ...otherValues } = values;

    createCommute.mutate({
      ...otherValues,
      date: dayjs(
        `${dayjs(date, "DD/MM/YYYY").format("YYYY-MM-DD")} ${
          otherValues.stops[0]?.time
        }`
      ).toDate(),
    });
  };

  const date = dayjs(dateQueryParam?.toString()).format(DAY_MONTH_YEAR);

  const fromTemplate = api.template.get.useQuery(
    { id: selectedTemplate ?? "" },
    {
      enabled: !!selectedTemplate && selectedTemplate !== FROM_SCRATCH,
    }
  );

  const stops = fromTemplate.data
    ? fromTemplate.data.stops.map((stop) => ({
        ...stop,
        location: stop.location?.id,
      }))
    : [];

  const form = useForm({
    onValidSubmit: handleOnValidSubmit,
    initialValues: {
      ...fromTemplate.data,
      seats: fromTemplate.data?.seats ?? undefined,
      stops,
      date,
    },
  });

  const commuteTemplates = api.template.myCommuteTemplates.useQuery(undefined, {
    onSuccess: (data) => {
      // If the user doesn't have any commute template, set the form to "FROM_SCRATCH" mode
      if (data.length === 0) {
        setSelectedTemplate(FROM_SCRATCH);
      }
    },
    // We don't want any caching here, too much rules to handle already. This might be optimized later.
    cacheTime: 0,
  });

  const createCommute = api.commute.createCommute.useMutation({
    onSuccess: async () => {
      await router.push("/commutes");
    },
  });

  const showForm =
    !!selectedTemplate &&
    (selectedTemplate === FROM_SCRATCH || !fromTemplate.isLoading);

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            onClick={() => router.back()}
          />
          <Heading size="md">New Commute</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - New Commute</title>
      </Head>
      {commuteTemplates.isLoading && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}
      {!selectedTemplate && !commuteTemplates.isLoading && (
        <Stack spacing="4">
          <Heading size="lg">Select a template</Heading>
          {commuteTemplates.data?.map((template) => (
            <Card
              boxShadow="card"
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardBody>
                <CommuteTemplateOverview {...template} />
              </CardBody>
            </Card>
          ))}
          <Button
            onClick={() => setSelectedTemplate(FROM_SCRATCH)}
            fontWeight="bold"
            variant="outline"
          >
            Start a commute from scratch
          </Button>
        </Stack>
      )}
      {showForm && (
        <Formiz autoForm connect={form}>
          <SimpleCard>
            <CommuteForm />
            <Button
              variant="primary"
              type="submit"
              isLoading={createCommute.isLoading}
            >
              Save
            </Button>
          </SimpleCard>
        </Formiz>
      )}
    </LayoutAuthenticated>
  );
};

export default New;
