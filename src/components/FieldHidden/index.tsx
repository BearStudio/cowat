import { FieldProps, useField } from '@formiz/core';

type FieldHiddenProps = FieldProps<unknown>;

export const FieldHidden = (props: FieldHiddenProps) => {

  useField(props);

  return null;
};