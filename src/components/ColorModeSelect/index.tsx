import { Stack, useColorMode } from "@chakra-ui/react";
import { FormGroup } from "@/components/FormGroup";
import { Select } from "@/components/Select";

export const ColorModeSelect = () => {
  const { colorMode, setColorMode } = useColorMode();

  return (
    <Stack>
      <FormGroup label="Color Mode" textTransform="capitalize">
        <Select
          value={{ value: colorMode, label: colorMode }}
          onChange={(newValue: any) => {
            setColorMode(newValue?.value);
          }}
          options={[
            { label: "light", value: "light" },
            { label: "dark", value: "dark" },
          ]}
        />
      </FormGroup>
    </Stack>
  );
};
