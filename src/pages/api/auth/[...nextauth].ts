import NextAuth, { type NextAuthOptions } from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import GoogleProvider from "next-auth/providers/google";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        const u = await prisma.user.findFirst({
          where: {
            id: user.id,
          },
          select: {
            role: true,
            slackMemberId: true,
          },
        });

        session.user.id = user.id;
        session.user.role = u?.role;
        session.user.slackMemberId = u?.slackMemberId;
      }
      return session;
    },
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        const domains = env.GOOGLE_AUTHORIZED_DOMAIN
          .split(',')
          .filter((domain) => !!domain)  // We don't keep as authorized domain empty string, in case there is a additional ',' in the GOOGLE_AUTHORIZED_DOMAIN const
          .map((domain)=>domain.trim());  // We remove whitespaces from the string to prevent error
        return (
          profile?.email_verified && 
          domains.includes(`@${profile.email?.split('@')[1]}` || '') 
        );
      }

      if (account?.provider === "slack") {
        const exists = await prisma.user.findFirst({
          where: {
            id: user.id,
          },
        });

        if (exists) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              slackMemberId: account.providerAccountId,
              image: profile?.picture, // Update user image with current slack profile picture to keep it up to date
            },
          });
        }
      }

      return true;
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    SlackProvider({
      clientId: env.SLACK_CLIENT_ID,
      clientSecret: env.SLACK_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

export default NextAuth(authOptions);
