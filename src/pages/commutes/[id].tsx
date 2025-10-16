import { CommuteForm } from "@/components/CommuteForm";
import { Icon } from "@/components/Icon";
import { Loader } from "@/components/Loader";
import { SimpleCard } from "@/components/SimpleCard";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";

import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import { Button, Heading, HStack, IconButton } from "@chakra-ui/react";
import { Formiz, useForm } from "@formiz/core";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

type EditCommuteInput = RouterInputs["commute"]["edit"];

const EditCommute: NextPage = () => {
  const router = useRouter();
  const ctx = api.useContext();

  const { id } = router.query;

  const commute = api.commute.commuteById.useQuery(
    { id: id?.toString() ?? "" },
    {
      enabled: !!id,
    }
  );

  const commuteMutation = api.commute.edit.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const handleOnValidSubmit = (values: EditCommuteInput) => {
    const { outwardTime, inwardTime, date, ...otherValues } = values;

    commuteMutation.mutate(
      {
        ...otherValues,
        outwardTime: dayjs(
          `${dayjs(date).format("YYYY-MM-DD")} ${outwardTime}`,
          "YYYY-MM-DD HH:mm"
        ).toDate(),
        inwardTime: dayjs(
          `${dayjs(date).format("YYYY-MM-DD")} ${inwardTime}`,
          "YYYY-MM-DD HH:mm"
        ).toDate(),
        date: dayjs(
          `${dayjs(commute.data?.date).format("DD/MM/YYYY")} ${
            commute.data?.date
          }`,
          "DD/MM/YYYY HH:mm"
        ).toDate(),
        id: id?.toString() ?? "",
      },
      {
        onSuccess: () => {
          ctx.commute.commuteById.invalidate();
        },
      }
    );
  };

  const intermediateStops =
    commute.data?.stops
      ?.filter((stop) => !stop.isOutward && !stop.isInward)
      .map((stop) => ({
        ...stop,
        location: stop.location?.id,
      })) ?? [];

  const defaultValues = {
    ...commute.data,
    stops: intermediateStops,
    commuteType: commute.data?.commuteType as "ROUND" | "ONEWAY",
    outwardLocation: commute.data?.stops?.find((stop) => stop.isOutward)?.location
      ?.id,
    outwardTime: dayjs(
      commute.data?.stops.find((stop) => stop.isOutward)?.time,
      "HH:mm"
    ).toDate(),
    inwardLocation:
      commute.data?.commuteType === "ROUND"
        ? commute.data?.stops?.find((stop) => stop.isInward)?.location?.id
        : undefined,
    inwardTime:
      commute.data?.commuteType === "ROUND"
        ? dayjs(
            commute.data?.stops?.find((stop) => stop.isInward)?.time,
            "HH:mm"
          ).toDate()
        : undefined,
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
            href="/dashboard"
          />
          <Heading size="md">Edit Commute</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - Edit Commute</title>
      </Head>
      {commute.isLoading && <Loader />}
      {!commute.isLoading && defaultValues && (
        <Formiz connect={editCommuteForm} autoForm>
          <SimpleCard>
            <CommuteForm
              mode="EDIT"
              repeaterInitialValues={defaultValues.stops}
            />
            <Button
              variant="primary"
              type="submit"
              isLoading={commuteMutation.isLoading}
            >
              Save
            </Button>
          </SimpleCard>
        </Formiz>
      )}
    </LayoutAuthenticated>
  );
};

export default EditCommute;
