import { CommuteForm } from "@/components/CommuteForm";
import { Icon } from "@/components/Icon";
import { Loader } from "@/components/Loader";
import { SimpleCard } from "@/components/SimpleCard";
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
    console.log(values)
    commuteMutation.mutate(
      { ...values, id: id?.toString() ?? "" },
      {
        onSuccess: () => {
          ctx.commute.commuteById.invalidate();
        },
      }
    );
  };

  const stops = commute.data
    ? commute.data.stops.map((stop) => ({
        ...stop,
        location: stop.location?.id,
      }))
    : [{}];

  const defaultValues = {
    ...commute.data,
    stops,
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
        <Formiz
          autoForm
          initialValues={defaultValues}
          onValidSubmit={handleOnValidSubmit}
        >
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
