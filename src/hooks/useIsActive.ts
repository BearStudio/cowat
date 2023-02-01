import { useRouter } from "next/router";

export const useIsActive = (path: string, exact = false) => {
  const router = useRouter();
  const isActive = exact
    ? router.pathname === path
    : router.pathname.startsWith(path);

  return isActive;
};
