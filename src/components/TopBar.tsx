import { signIn, signOut, useSession } from "next-auth/react";

import Link from "next/link";

const navigation = [
  { name: "Stops", href: "/stops" },
  { name: "Commutes", href: "/commutes" },
];

export function TopBar() {
  const { data: sessionData } = useSession();

  return (
    <header className="bg-brand-600">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-brand-500 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/">
              <span className="sr-only">Cowat</span>
              <img
                className="h-10 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=white"
                alt=""
              />
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              {navigation.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-white hover:text-brand-50"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <button
              onClick={sessionData ? () => void signOut() : () => void signIn()}
              className="inline-block rounded-md border border-transparent bg-brand-500 py-2 px-4 text-base font-medium text-white hover:bg-opacity-75"
            >
              {sessionData ? sessionData.user?.name : "Sign in"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 py-4 lg:hidden">
          {navigation.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-base font-medium text-white hover:text-brand-50"
            >
              {link.name}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
