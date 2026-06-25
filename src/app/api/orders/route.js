import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { deliveryType, paymentMethod } = body;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'Order Received',
        totalAmount: 1299,
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay / Online',
        deliveryType: deliveryType === 'home' ? 'Home Delivery' : 'Shop Pickup',
        items: {
          create: {
            category: 'Custom Shirt (Cotton)'
          }
        }
      }
    });

    return new Response(JSON.stringify({ orderId: order.id }), { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
