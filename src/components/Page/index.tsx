import React, { useContext, useEffect, useState } from "react";

import type { FlexProps } from "@chakra-ui/react";
import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import useMeasure from "react-use-measure";

const PAGE_TOPBAR_MARGIN = 16;

type PageContextValue = {
  nav: React.ReactNode;
  hideContainer: boolean;
  containerSize: "sm" | "md" | "lg" | "xl" | "full";
};

const PageContext = React.createContext<PageContextValue>({
  nav: null,
  hideContainer: false,
  containerSize: "md",
});

const PageContainer = ({ children, ...rest }: FlexProps) => {
  const { hideContainer, containerSize } = useContext(PageContext);

  if (hideContainer) return <>{children}</>;

  return (
    <Container
      direction="column"
      flex="1"
      w="full"
      px="6"
      mx="auto"
      maxW={containerSize === "full" ? "full" : `container.${containerSize}`}
      {...rest}
    >
      {children}
    </Container>
  );
};

type PageTopBarProps = FlexProps & {
  onBack?(): void;
  showBack?: boolean;
};

const topBarOffsetScroll = 40;

export const PageTopBar = ({
  children,
  onBack = () => undefined,
  showBack = false,
  ...rest
}: PageTopBarProps) => {
  const [ref, { height }] = useMeasure();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > topBarOffsetScroll) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Flex
        zIndex="2"
        ref={ref}
        position="fixed"
        top={0}
        right={0}
        left={0}
        direction="column"
        pt={isScrolled ? 2 : 4}
        pb={isScrolled ? 2 : 4}
        boxShadow="layout"
        transition="0.2s"
        bg="white"
        _dark={{ bg: "black" }}
        {...rest}
      >
        <Box w="full" h="0" pb="safe-top" />
        <PageContainer>
          <HStack spacing="4">
            {showBack && (
              <Box ms={{ base: 0, lg: "-3.5rem" }}>
                <IconButton
                  aria-label="Go Back"
                  icon={<FiArrowLeft />}
                  variant="ghost"
                  onClick={() => onBack()}
                />
              </Box>
            )}
            <Box flex="1">{children}</Box>
          </HStack>
        </PageContainer>
      </Flex>
      <Box h={`${height + PAGE_TOPBAR_MARGIN}px`} />
    </>
  );
};

type PageContentProps = FlexProps & {
  onBack?(): void;
  showBack?: boolean;
};

export const PageContent = ({ children, ...rest }: PageContentProps) => {
  const { nav } = useContext(PageContext);
  return (
    <Flex zIndex="1" direction="column" flex="1" pb="10" {...rest}>
      <PageContainer>
        <Stack
          direction={{ base: "column", lg: "row" }}
          spacing={{ base: "4", lg: "8" }}
          flex="1"
        >
          {nav && (
            <Flex direction="column" minW="0" w={{ base: "full", lg: "12rem" }}>
              {nav}
            </Flex>
          )}
          <Flex direction="column" flex="1" minW="0">
            {children}
          </Flex>
        </Stack>
      </PageContainer>
      <Box w="full" h="0" pb="safe-bottom" />
    </Flex>
  );
};

export const PageBottomBar = ({ children, ...rest }: FlexProps) => {
  const [ref, { height }] = useMeasure();

  return (
    <>
      <Box h={`${height}px`} />
      <Flex
        zIndex="3"
        ref={ref}
        direction="column"
        mt="auto"
        position="fixed"
        bottom="0"
        insetStart="0"
        insetEnd="0"
        py="0"
        bg="white"
        _dark={{ bg: "gray.900" }}
        {...rest}
      >
        <PageContainer>{children}</PageContainer>
        <Box w="full" h="0" pb="safe-bottom" />
      </Flex>
    </>
  );
};

export type PageProps = FlexProps & {
  isFocusMode?: boolean;
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  hideContainer?: boolean;
  nav?: React.ReactNode;
};

export const Page = ({
  hideContainer = false,
  containerSize = "md",
  nav = null,
  ...rest
}: PageProps) => {
  return (
    <PageContext.Provider
      value={{
        nav,
        hideContainer,
        containerSize,
      }}
    >
      <Flex direction="column" flex="1" position="relative" {...rest} />
    </PageContext.Provider>
  );
};
