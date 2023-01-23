import { RequestStatus } from "@prisma/client";

export const isValidRequestStatusTransition = (
  start: RequestStatus,
  end: RequestStatus
) => {
  const transitions: Record<RequestStatus, Array<RequestStatus>> = {
    [RequestStatus.REQUESTED]: [
      RequestStatus.ACCEPTED,
      RequestStatus.REFUSED,
      RequestStatus.CANCELED,
    ],
    [RequestStatus.ACCEPTED]: [RequestStatus.REFUSED, RequestStatus.CANCELED],
    [RequestStatus.REFUSED]: [RequestStatus.ACCEPTED],
    [RequestStatus.CANCELED]: [RequestStatus.REQUESTED],
  };

  return transitions[start].includes(end);
};

export const RequestStatusColorSchemes: Record<RequestStatus, string> = {
  [RequestStatus.REQUESTED]: "warning",
  [RequestStatus.ACCEPTED]: "success",
  [RequestStatus.REFUSED]: "error",
  [RequestStatus.CANCELED]: "gray",
} as const;
