import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const db = await getDb();
        console.log('[NextAuth] Attempting login for:', credentials.email);
        const { data: user, error } = await db
          .from('users')
          .select('*')
          .eq('email', credentials.email)
          .single();

        if (error) {
          console.error('[NextAuth] Database query error:', error.message);
          return null;
        }

        if (!user) {
          console.log('[NextAuth] User not found');
          return null;
        }

        if (!user.password) {
          console.log('[NextAuth] User has no password set');
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        console.log('[NextAuth] Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
};

const handler = async (req, ctx) => {
  const host = req.headers.get('host');
  if (host) {
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    process.env.NEXTAUTH_URL = `${protocol}://${host}`;
  }
  return NextAuth(authOptions)(req, ctx);
};

export { handler as GET, handler as POST };
