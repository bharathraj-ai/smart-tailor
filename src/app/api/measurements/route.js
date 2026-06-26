import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();
    
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const measurement = await prisma.measurement.create({
      data: {
        userId: user.id,
        name: 'Custom Entry',
        chest: body.chest ? parseFloat(body.chest) : null,
        waist: body.waist ? parseFloat(body.waist) : null,
        hip: body.hip ? parseFloat(body.hip) : null,
        shoulder: body.shoulder ? parseFloat(body.shoulder) : null,
        sleeveLength: body.sleeveLength ? parseFloat(body.sleeveLength) : null,
        neckSize: body.neckSize ? parseFloat(body.neckSize) : null,
        height: body.height ? parseFloat(body.height) : null,
        customNotes: body.customNotes || null,
      }
    });

    return new Response(JSON.stringify({ measurementId: measurement.id }), { status: 201 });
  } catch (error) {
    console.error('Measurement creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
