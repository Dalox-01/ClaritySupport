import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { supabase, User } from './db';
import { createAuditLog } from './db';
import { logInfo } from './logger';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // Simple auth - just use email for demo
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.name || 'User',
        };
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      logInfo('SignIn callback triggered', { 
        email: user.email, 
        provider: account?.provider 
      });
      
      if (!user.email) return false;

      try {
        logInfo('Checking for existing user', { email: user.email });
        
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existingUser) {
          logInfo('Creating new user', { email: user.email });
          
          const currentMonth = parseInt(
            `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`
          );

          const { error } = await supabase.from('users').insert({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider || 'credentials',
            stripe_customer_id: null,
            plan: 'FREE',
            usage_month: currentMonth,
            usage_count: 0,
            tokens_used: 0,
            role: 'USER',
          });

          if (error) {
            logInfo('Failed to create user', { error });
            return false;
          }

          logInfo('User created successfully', { email: user.email });

          await createAuditLog(null, 'user_created', {
            email: user.email,
            provider: account?.provider,
          });
        } else {
          logInfo('Existing user login', { email: user.email });
          
          await createAuditLog(existingUser.id, 'user_login', {
            provider: account?.provider,
          });
        }

        logInfo('SignIn successful', { email: user.email });
        return true;
      } catch (error) {
        logInfo('SignIn error', { error });
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      logInfo('Redirect callback', { url, baseUrl });
      
      // Si l'URL contient ?extension=true, garder cette page
      if (url.includes('extension=true')) {
        return url;
      }
      
      // Always redirect to dashboard after successful sign in
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return `${baseUrl}/dashboard`;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        const { data: user } = await supabase
          .from('users')
          .select('id, email, name, image, role, plan, stripe_customer_id')
          .eq('email', session.user.email)
          .single();

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            role: user.role,
            plan: user.plan,
            stripeCustomerId: user.stripe_customer_id,
          };
        }
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'USER' | 'ADMIN';
      plan: 'FREE' | 'STARTER' | 'PRO' | 'SCALE' | 'ADMIN';
      stripeCustomerId?: string | null;
    };
  }
}
