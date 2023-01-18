import { classed } from "@tw-classed/react";

export const Input = classed(
  "input",
  "block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm"
);

export type InputProps = React.ComponentProps<typeof Input>;
