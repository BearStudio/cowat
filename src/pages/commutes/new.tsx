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
import { FieldTextarea } from "@/components/FieldTextarea";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { DAY_MONTH_YEAR } from "@/constants/dates";
import { CommuteForm } from "@/components/CommuteForm";
import { useEffect, useState } from "react";
import { CommuteTemplateOverview } from "@/components/CommuteTemplateOverview";

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

  const form = useForm();

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
    : [{}];

  const defaultValues = {
    ...fromTemplate.data,
    stops,
    date,
  };

  const createCommute = api.commute.createCommute.useMutation({
    onSuccess: async () => {
      await router.push("/commutes");
    },
  });

  const handleOnValidSubmit = (
    values: Omit<CreateCommuteInput, "date"> & { date: Dayjs; time: string }
  ) => {
    const { date, time, ...otherValues } = values;

    createCommute.mutate({
      ...otherValues,
      date: dayjs(`${date.format("YYYY-MM-DD")} ${time}`).toDate(),
    });
  };

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
          <Heading size="md">New commute</Heading>
        </HStack>
      }
    >
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
        <Formiz
          onValidSubmit={handleOnValidSubmit}
          autoForm
          connect={form}
          initialValues={defaultValues}
        >
          <Stack bg="white" rounded="lg" boxShadow="card" p="8" spacing="4">
            <CommuteForm repeaterInitialValues={defaultValues.stops} />
            <FieldTextarea label="Comment" name="comment" />
            <Button
              variant="primary"
              type="submit"
              isLoading={createCommute.isLoading}
            >
              Save
            </Button>
          </Stack>
        </Formiz>
      )}
    </LayoutAuthenticated>
  );
};

export default New;
