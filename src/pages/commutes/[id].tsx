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

type EditCommuteInputValues = Omit<
  EditCommuteInput,
  "date" | "outwardTime" | "inwardTime" | "commuteType"
> & {
  date: Date;
  outwardTime: Date;
  inwardTime: Date;
  commuteType: boolean;
};

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

  const handleOnValidSubmit = (values: EditCommuteInputValues) => {
    const { outwardTime, inwardTime, date, ...otherValues } = values;

    commuteMutation.mutate(
      {
        ...otherValues,
        commuteType: commute.data?.commuteType ? "ROUND" : "ONEWAY",
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

  const intermediateStops = commute.data
    ? commute.data.stops
        .slice(
          1, // remove the first
          commute.data.commuteType === "ROUND"
            ? -1 // for ROUND remove the last
            : commute.data.stops.length
        )
        .map((stop) => ({
          ...stop,
          location: stop.location?.id,
        }))
    : [];

  const defaultValues = {
    ...commute.data,
    stops: intermediateStops,
    commuteType:
      commute.data?.commuteType === "ROUND" ||
      commute.data?.commuteType === undefined,
    outwardLocation: commute.data?.stops?.[0]?.location?.id,
    outwardTime: dayjs(commute.data?.stops?.[0]?.time, "HH:mm").toDate(),
    inwardLocation:
      commute.data?.commuteType === "ROUND"
        ? commute.data?.stops?.[commute.data.stops.length - 1]?.location?.id
        : undefined,
    inwardTime:
      commute.data?.commuteType === "ROUND"
        ? dayjs(
            commute.data?.stops?.[commute.data.stops.length - 1]?.time,
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
