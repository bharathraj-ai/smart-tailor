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

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email },
      include: { measurements: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    let latestMeasurementId = user.measurements.length > 0 ? user.measurements[0].id : undefined;

    if (!latestMeasurementId) {
      const newMeasurement = await prisma.measurement.create({
        data: {
          userId: user.id,
          name: 'Auto-generated Measurements',
          chest: 38,
          waist: 32,
          hip: 39,
          shoulder: 17,
          sleeveLength: 24,
          neckSize: 15,
          height: 68
        }
      });
      latestMeasurementId = newMeasurement.id;
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
            category: 'Custom Shirt (Cotton)',
            measurementId: latestMeasurementId
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
