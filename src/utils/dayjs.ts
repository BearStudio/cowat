import dayjsLib from "dayjs";

export const dayjsTz: (
  ...args: Parameters<typeof dayjsLib>
) => ReturnType<typeof dayjsLib.tz> = (...args) => dayjsLib(...args).tz();

export const dayjsTzConfig = dayjsLib.tz;
