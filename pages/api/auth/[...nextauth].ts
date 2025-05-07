import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      const email = user.email as string;
      if (email.endsWith('@identos.ca')) {
        return true;
      }
      return false; // Reject sign in for other domains
    },
    async session({ session, token }: any) {
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Add custom error page
  },
};

export default NextAuth(authOptions); 