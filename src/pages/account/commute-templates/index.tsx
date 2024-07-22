import { CommuteTemplateOverview } from "@/components/CommuteTemplateOverview";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { LayoutAuthenticated } from "@/layout/LayoutAuthenticated";
import { api } from "@/utils/api";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Center,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import type { Prisma } from "@prisma/client";
import { ArrowLeft, Car, Pencil, Plus, Trash } from "lucide-react";
import Head from "next/head";
import Link from "next/link";

const Commutes = () => {
  const commuteTemplates = api.template.myCommuteTemplates.useQuery();

  return (
    <LayoutAuthenticated
      hideNav
      topBar={
        <HStack>
          <IconButton
            as={Link}
            size="sm"
            aria-label="Go back"
            icon={<Icon icon={ArrowLeft} />}
            href="/account"
          />
          <Heading size="md" flex={1}>
            Commute Templates
          </Heading>
          <IconButton
            size="sm"
            variant="primary"
            aria-label="Create location"
            icon={<Icon icon={Plus} />}
            as={Link}
            href="/account/commute-templates/new"
          />
        </HStack>
      }
    >
      <Head>
        <title>Cowat - Commute Templates</title>
      </Head>
      {commuteTemplates.isLoading && (
        <Center flex="1">
          <Spinner />
        </Center>
      )}
      <Stack spacing="4" as="main">
        {commuteTemplates.data?.length === 0 && (
          <EmptyState>You have no commute template at the moment.</EmptyState>
        )}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
          {commuteTemplates.data?.map((template, index) => (
            <CommuteTemplateCard
              key={template.id}
              template={template}
              index={index}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </LayoutAuthenticated>
  );
};

export default Commutes;

type CommuteTemplateCardProps = {
  template: Prisma.CommuteTemplateGetPayload<{
    include: {
      stops: {
        select: {
          id: true;
          location: true;
          time: true;
        };
      };
    };
  }>;
  index: number;
};

const CommuteTemplateCard = ({ template, index }: CommuteTemplateCardProps) => {
  const ctx = api.useContext();

  const removeCommuteTemplate = api.template.remove.useMutation({
    onSuccess: () => {
      ctx.template.myCommuteTemplates.invalidate();
    },
  });

  return (
    <Card shadow="card">
      <CardBody>
        <CommuteTemplateOverview {...template} index={index} />
      </CardBody>
      <CardFooter gap="2">
        <Button
          variant="primary"
          leftIcon={<Icon icon={Car} />}
          as={Link}
          href={`/commutes/new?template=${template.id}`}
          flex="1"
        >
          New
        </Button>
        <Button
          variant="default"
          leftIcon={<Icon icon={Pencil} />}
          as={Link}
          href={`/account/commute-templates/${template.id}`}
          flex="1"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          leftIcon={<Icon icon={Trash} />}
          flex="1"
          onClick={() => removeCommuteTemplate.mutate({ id: template.id })}
          isLoading={removeCommuteTemplate.isLoading}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
