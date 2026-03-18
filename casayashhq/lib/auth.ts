import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = process.env.CEO_EMAIL;
        const hash = process.env.CEO_PASSWORD_HASH;
        if (!email || !hash) return null;
        if (credentials.email !== email) return null;
        const valid = await bcrypt.compare(credentials.password, hash);
        if (!valid) return null;
        return { id: "ceo", email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async session({ session, token }) {
      if (token.email)
        session.user = { email: token.email as string, name: null, image: null };
      return session;
    },
  },
};
