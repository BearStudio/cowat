import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Button, Heading, Stack } from "@chakra-ui/react";
import { MapPin, UserCogIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

const AccountPage = () => {
  return (
    <LayoutAuthenticated topBar={<Heading size="md">Account</Heading>}>
      <Stack spacing="4">
        <Button
          variant="default"
          as={Link}
          href="/account/locations"
          leftIcon={<Icon icon={MapPin} />}
        >
          Locations
        </Button>
        <Button
          variant="default"
          as={Link}
          href="/account/profile"
          leftIcon={<Icon icon={UserCogIcon} />}
        >
          Profile
        </Button>
        <Button variant="link" onClick={() => signOut()}>
          Log out
        </Button>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default AccountPage;
