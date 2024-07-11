import { FieldInput } from "@/components/FieldInput";
import { FieldTextarea } from "@/components/FieldTextarea";
import { Icon } from "@/components/Icon";
import { API_STRING_MAX_LENGTH } from "@/constants/api";
import { searchOnMaps } from "@/constants/google";
import { Button, Link } from "@chakra-ui/react";
import { useFormFields } from "@formiz/core";
import { isMaxLength } from "@formiz/validations";
import { ExternalLink } from "lucide-react";

export const LocationForm = () => {
  const fields = useFormFields();

  return (
    <>
      <FieldInput
        label="Name"
        name="name"
        required="Please provide a name"
        mb={3}
      />
      <FieldTextarea
        mb={1}
        label="Address"
        name="address"
        required="Please provide an address"
        validations={[
          {
            handler: isMaxLength(API_STRING_MAX_LENGTH),
            message: `Address length should be less than ${API_STRING_MAX_LENGTH}`,
          },
        ]}
      />
      <Button
        as={Link}
        href={fields.address?.value ? searchOnMaps(fields.address.value) : "#"}
        isDisabled={!fields.address?.value}
        title="Open the address on Google Maps"
        isExternal={!!fields.address?.value}
        rightIcon={<Icon icon={ExternalLink} />}
      >
        Maps
      </Button>
    </>
  );
};
