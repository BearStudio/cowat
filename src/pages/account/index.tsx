import { ColorModeSelect } from "@/components/ColorModeSelect";
import { Icon } from "@/components/Icon";

import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { Button, Divider, Heading, Stack } from "@chakra-ui/react";

import { Car, MapPin, UserCogIcon, Webhook } from "lucide-react";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

const AccountPage = () => {
  return (
    <LayoutAuthenticated topBar={<Heading size="md">Account</Heading>}>
      <Head>
        <title>Cowat - Account</title>
      </Head>
      <Stack spacing="4">
        <ColorModeSelect />
        <Divider />

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
          href="/account/commute-templates"
          leftIcon={<Icon icon={Car} />}
        >
          Commute Templates
        </Button>
        <Button
          variant="default"
          as={Link}
          href="/account/profile"
          leftIcon={<Icon icon={UserCogIcon} />}
        >
          Profile
        </Button>
        <Button
          variant="default"
          as={Link}
          href="/account/subscriptions"
          leftIcon={<Icon icon={Webhook} />}
        >
          Webhooks
        </Button>
        <Divider />
        <Button variant="link" onClick={() => signOut()}>
          Log out
        </Button>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default AccountPage;
