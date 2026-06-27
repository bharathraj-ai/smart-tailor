import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const db = await getDb();

    const { data: user } = await db
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user || user.role !== 'tailor') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    const { status } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Invalid order ID' }), { status: 400 });
    }

    const { data: result, error: updateError } = await db
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!result) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ order: result }), { status: 200 });
  } catch (error) {
    console.error('Update order error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
