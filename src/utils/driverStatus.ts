import type { ThemeTypings } from "@chakra-ui/styled-system";
import type { CommuteStatus } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import type { ReactNode } from "react";

export const DRIVER_STATUS: Record<
  CommuteStatus,
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
};
