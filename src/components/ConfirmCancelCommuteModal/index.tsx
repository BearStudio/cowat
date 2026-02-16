import { ConfirmModal } from "@/components/ConfirmModal";
import { Icon } from "@/components/Icon";
import { FULL_TEXT_DATE, ONLY_TIME } from "@/constants/dates";
import type { RouterOutputs } from "@/utils/api";
import { api } from "@/utils/api";
import { getPassengers } from "@/utils/commutes";
import { Button, chakra, useBreakpointValue } from "@chakra-ui/react";
import dayjs from "dayjs";
import { Trash } from "lucide-react";

type ConfirmCancelCommuteModalProps = {
  commute: RouterOutputs["commute"]["commuteById"];
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
  const passengers = getPassengers(commute.stops, commute.commuteType);

  const isMobile = useBreakpointValue({ base: true, md: false });

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
            {dayjs(commute.date).format(FULL_TEXT_DATE)}{" "}
            {dayjs(commute.outwardTime).format(ONLY_TIME)}
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
        <Icon icon={Trash} mr={!isMobile ? 2 : 0} />
        {!isMobile && "Cancel commute"}
      </Button>
    </ConfirmModal>
  );
};
