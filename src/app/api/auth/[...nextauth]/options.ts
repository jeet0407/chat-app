import { AuthOptions, ISODateString } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

export interface Session {
  user?: User;
  expires: ISODateString;
}

export interface User {
  id?: string | null;
  name?: string;
  email?: string;
  image?: string;
  provider?: string | null;
  token?: string | null;
}

export const authOption: AuthOptions = {
  pages: {
    signIn: "/",
  },

  callbacks: {
    async signIn({ user, account }) {
      console.log("user", user);
      console.log("account", account);
      return true;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token?.user) {
        session.user = token.user as User;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }

      return token;
    },
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
