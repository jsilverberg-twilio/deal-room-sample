import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const seller = await prisma.seller.findUnique({
          where: { email: credentials.email as string },
        });
        if (!seller) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          seller.passwordHash
        );
        if (!valid) return null;
        return { id: seller.id, email: seller.email, name: seller.name };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
