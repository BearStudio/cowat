import type { InputProps } from "@/components/Input";
import { Input } from "@/components/Input";
import { useField } from "@formiz/core";
import type { UseFieldProps } from "@formiz/core/dist/types/field.types";
import type { FC, PropsWithChildren } from "react";

export const FieldInput: FC<
  PropsWithChildren<InputProps & UseFieldProps & { label?: string }>
> = (props) => {
  const { setValue, value, otherProps } = useField(props);
  const { name } = otherProps;

  return (
    <div>
      {props.label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {props.label}
        </label>
      )}
      <div className="mt-1">
        <Input
          placeholder="3"
          value={value ?? ""}
          onChange={(e) => setValue(e.target.value)}
          id={name}
          name={name}
          {...otherProps}
        />
      </div>
    </div>
  );
};
