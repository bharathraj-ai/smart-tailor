import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    const { deliveryType, deliveryAddress, paymentMethod, category, totalAmount } = body;

    const db = await getDb();

    const { data: user } = await db
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const userId = user.id;

    // Find latest measurement
    const { data: latestMeasurementData } = await db
      .from('measurements')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    let latestMeasurement = latestMeasurementData;

    if (!latestMeasurement) {
      const { data: insertedMeasurement, error: mError } = await db
        .from('measurements')
        .insert([
          {
            userId,
            name: 'Auto-generated Measurements',
            chest: 38, waist: 32, hip: 39,
            shoulder: 17, sleeveLength: 24,
            neckSize: 15, height: 68,
          }
        ])
        .select()
        .single();
      
      if (mError) {
        throw mError;
      }
      latestMeasurement = insertedMeasurement;
    }

    // Create order
    const orderData = {
      userId,
      status: 'Order Received',
      totalAmount: totalAmount ? parseFloat(totalAmount) : 1299,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay / Online',
      deliveryType: deliveryType === 'home' ? 'Home Delivery' : 'Shop Pickup',
    };

    // Only include deliveryAddress if it's a home delivery with an address
    if (deliveryType === 'home' && deliveryAddress) {
      orderData.deliveryAddress = deliveryAddress;
    }

    const { data: orderResult, error: orderError } = await db
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Create order item
    const { error: itemError } = await db
      .from('orderItems')
      .insert([
        {
          orderId: orderResult.id,
          category: category || 'Custom Garment',
          measurementId: latestMeasurement.id,
        }
      ]);

    if (itemError) {
      throw itemError;
    }

    return new Response(JSON.stringify({ orderId: orderResult.id }), { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
