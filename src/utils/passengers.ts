import { RequestStatus } from "@prisma/client";

export const NOT_YET_PASSENGER_IF_INSIDE: Array<RequestStatus> = [
  RequestStatus.REQUESTED,
  RequestStatus.REFUSED,
];
