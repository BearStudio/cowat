import type { User, UserRole } from "@prisma/client";
import type { DefaultSession, Profile as DefaultProfile } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string;
      role: UserRole | null | undefined;
      slackMemberId?: User["slackMemberId"];
    } & DefaultSession["user"];
  }

  interface Profile extends DefaultProfile {
    // TODO If we put boolean, the `signIn` method from auth.js is not correct anymore. But `any` is OK.
    email_verified: TODO;
    picture?: string; // Slack profile picture
  }
}
