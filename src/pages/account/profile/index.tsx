import { FieldInput } from "@/components/FieldInput";
import { FieldSwitch } from "@/components/FieldSwitch";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import type { RouterInputs } from "@/utils/api";
import { api } from "@/utils/api";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Formiz } from "@formiz/core";
import { ArrowLeft, MoreVerticalIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

type UpdateProfileInput = RouterInputs["user"]["updateProfile"];

const ProfilePage = () => {
  const ctx = api.useContext();
  const router = useRouter();
  const { update } = useSession();

  const profileMutation = api.user.updateProfile.useMutation();
  const profile = api.user.profile.useQuery();

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            as={Link}
            href="/account"
          />
          <Heading size="md">Profile</Heading>
        </HStack>
      }
    >
      <Head>
        <title>Cowat - Profile</title>
      </Head>
      {profile.isLoading && (
        <Center flex={1}>
          <Spinner />
        </Center>
      )}
      {profile.data && (
        <Stack
          spacing="4"
          as="main"
          boxShadow="card"
          p="4"
          bg="white"
          rounded="md"
          _dark={{
            bg: "gray.800",
          }}
        >
          <Formiz
            autoForm
            onValidSubmit={(values: UpdateProfileInput) =>
              profileMutation.mutate(values, {
                onSuccess: () => {
                  update();
                  ctx.user.profile.invalidate();
                  router.push("/account");
                },
              })
            }
            initialValues={profile.data}
          >
            <Stack>
              <FieldInput
                name="slackMemberId"
                label="Slack Member Id"
                required="The Slack member id is required if you want to use Cowat"
                formatValue={(value) => value?.trim()}
              />

              <Alert variant="infoGray" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>
                    Your slack member id can be copied from your slack account
                    on desktop
                  </AlertTitle>

                  <AlertDescription alignContent="center">
                    <Text>
                      On your profile, click on
                      <MoreVerticalIcon
                        style={{ display: "inline", verticalAlign: "middle" }}
                      />
                      and select &quot;copy member ID&quot;
                    </Text>
                  </AlertDescription>
                </Box>
              </Alert>
              <FieldInput name="phone" label="Phone number" />
              <FieldSwitch name="autoAccept" label="Auto-accept" />
              <Button
                variant="primary"
                type="submit"
                isLoading={profileMutation.isLoading}
              >
                Save
              </Button>
            </Stack>
          </Formiz>
        </Stack>
      )}
    </LayoutAuthenticated>
  );
};

export default ProfilePage;
