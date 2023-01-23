import type { FC } from "react";

import { Center, Heading, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

import { Illustration403 } from "./Illustration403";
import { Illustration404 } from "./Illustration404";
import { IllustrationDefault } from "./IllustrationDefault";

const Illustrations: Record<"default" | number, FC> = {
  403: Illustration403,
  404: Illustration404,
  default: IllustrationDefault,
};

export const ErrorPage = ({ errorCode }: { errorCode?: number }) => {
  const errorType =
    errorCode && Object.keys(Illustrations).some((c) => c === String(errorCode))
      ? errorCode
      : "default";
  const Illustration = Illustrations[errorType] ?? Illustrations.default;

  return (
    <Center flex="1" p="8">
      <Stack
        direction={{ base: "column-reverse", md: "row" }}
        align="center"
        spacing={4}
      >
        <Illustration />
        <Stack
          textAlign={{ base: "center", md: "left" }}
          alignItems={{ base: "center", md: "flex-start" }}
        >
          <Link href="/">Cowat</Link>
          <Heading>Error</Heading>
          <Text>An error occured</Text>
          {!!errorCode && (
            <Text
              color="gray.500"
              _dark={{ color: "gray.400" }}
              fontSize="sm"
              mt={4}
            >
              {errorCode}
            </Text>
          )}
        </Stack>
      </Stack>
    </Center>
  );
};
