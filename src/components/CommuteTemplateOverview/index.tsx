import { Stack, StackDivider, Text } from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";

type CommuteTemplateOverviewProps = Prisma.CommuteTemplateGetPayload<{
  include: {
    stops: {
      select: {
        id: true;
        location: true;
        time: true;
      };
    };
  };
}>;

export const CommuteTemplateOverview = (
  props: CommuteTemplateOverviewProps
) => {
  return (
    <Stack divider={<StackDivider borderColor="blackAlpha.100" />} spacing="4">
      {props.seats && (
        <Text>
          💺 {props.seats} seat{props.seats > 1 ? "s" : ""}
        </Text>
      )}
      {props.stops.map((stop) => (
        <Stack spacing={0} flex={1} key={stop.id}>
          <Text fontSize="sm" fontWeight="bold">
            📍 {!!stop.time && `${stop.time} · `}
            {stop?.location?.name}{" "}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {stop?.location?.address}
          </Text>
        </Stack>
      ))}
    </Stack>
  );
};
