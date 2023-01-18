import { classed } from "@tw-classed/react";

export const Button = classed("button", "rounded-md", {
  variants: {
    variant: {
      primary: "bg-brand-800 text-white",
      secondary: "bg-white border-brand-800 text-brand-800 ",
    },
    size: {
      sm: "py-2 px-4 text-sm",
      md: "py-2 px-4",
      lg: "py-4 px-8 text-lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
