import { FieldInput } from "@/components/FieldInput";
import { FieldTextarea } from "@/components/FieldTextarea";
import { Icon } from "@/components/Icon";
import { Button, Link, Stack } from "@chakra-ui/react";
import { useFormFields } from "@formiz/core";
import { ExternalLink } from "lucide-react";

export const LocationForm = () => {
  const fields = useFormFields();

  return (
    <Stack>
      <FieldInput label="Name" name="name" required="Please provide a name" />
      <FieldTextarea
        label="Address"
        name="address"
        required="Please provide an address"
      />
      <Button
        as={Link}
        href={`https://www.google.com/maps/search/${fields.address?.value}`}
        isDisabled={!fields.address?.value}
        title="Open the address on Google Maps"
        isExternal
        rightIcon={<Icon icon={ExternalLink} />}
      >
        Maps
      </Button>
      <Button variant="primary" type="submit">
        Save
      </Button>
    </Stack>
  );
};
