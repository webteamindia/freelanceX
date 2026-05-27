import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXTAUTH_SECRET?.trim()
) {
  throw new Error(
    "NEXTAUTH_SECRET must be set in production. Generate one with: openssl rand -base64 32"
  );
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.email) {
        session.user.email = token.email;
      }
      return session;
    },
  },
});

