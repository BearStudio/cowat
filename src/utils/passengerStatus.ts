import type { ThemeTypings } from "@chakra-ui/styled-system";
import type { StopStatus } from "@prisma/client";
import {
  CheckCircle,
  Clock,
  Hourglass,
  LucideIcon,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

export const PASSENGER_STATUS: Record<
  StopStatus,
  {
    colorScheme: ThemeTypings["colorSchemes"];
    text: string | ReactNode;
    icon: LucideIcon;
  }
> = {
  UNKNOWN: {
    colorScheme: "gray",
    icon: XCircle,
    text: "Unknown",
  },
  ON_TIME: {
    colorScheme: "success",
    icon: CheckCircle,
    text: "On Time",
  },
  DELAYED: {
    colorScheme: "error",
    icon: Clock,
    text: "Late",
  },
  AWAITING: {
    colorScheme: "warning",
    icon: Hourglass,
    text: "Awaiting",
  },
};
