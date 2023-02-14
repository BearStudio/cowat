import dayjsLib from "dayjs";

export const dayjsTz = (...args: Parameters<typeof dayjsLib>) =>
  dayjsLib(...args).tz();

export const dayjsTzConfig = dayjsLib.tz;
