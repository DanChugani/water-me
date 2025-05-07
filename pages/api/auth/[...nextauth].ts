import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      console.log('SignIn callback triggered for user:', user.email);
      const email = user.email as string;
      if (email.endsWith('@identos.ca')) {
        console.log('User authorized:', email);
        return true;
      }
      console.log('User not authorized:', email);
      return false; // Reject sign in for other domains
    },
    async session({ session }) {
      console.log('Session callback triggered:', session);
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error', // Add custom error page
    signOut: '/auth/signin', // Redirect to sign-in page after signing out
  },
  debug: true, // Enable debug messages
};

export default NextAuth(authOptions); 