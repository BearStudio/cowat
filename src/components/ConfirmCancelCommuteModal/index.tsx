import { ConfirmModal } from "@/components/ConfirmModal";
import { FULL_TEXT_DATE_WITH_TIME } from "@/constants/dates";
import { api } from "@/utils/api";
import type { CommuteType } from "@/utils/commutes";
import { getPassengers } from "@/utils/commutes";
import { Button } from "@chakra-ui/react";
import { chakra } from "@chakra-ui/react";
import dayjs from "dayjs";

type ConfirmCancelCommuteModalProps = {
  commute: CommuteType;
};

export const ConfirmCancelCommuteModal = ({
  commute,
}: ConfirmCancelCommuteModalProps) => {
  const ctx = api.useContext();
  const cancelCommute = api.commute.cancelCommute.useMutation({
    onSuccess: async () => {
      await ctx.commute.invalidate();
    },
  });
  const passengers = getPassengers(commute.stops);
  return (
    <ConfirmModal
      onConfirm={() => {
        cancelCommute.mutate({ id: commute.id });
      }}
      confirmVariant="danger"
      confirmText="Cancel commute"
      cancelText="Keep"
      title="You're about to cancel the following commute"
      message={
        <>
          <strong>
            {dayjs(commute.date).format(FULL_TEXT_DATE_WITH_TIME)}
          </strong>{" "}
          commute
          <br />
          with{" "}
          <chakra.strong
            color={passengers.length > 0 ? "error.700" : "success.600"}
          >
            {passengers.length ?? ""} passenger
            {passengers.length > 1 ? "s" : ""}
          </chakra.strong>
          .
        </>
      }
    >
      <Button variant="danger" isLoading={cancelCommute.isLoading}>
        Cancel commute
      </Button>
    </ConfirmModal>
  );
};
