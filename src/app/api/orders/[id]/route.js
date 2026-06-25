import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || user.role !== 'tailor') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { status } = body;

    const order = await prisma.order.update({
      where: { id },
      data: { status }
    });

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    console.error('Update order error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
