require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find all order items with no measurement
  const items = await prisma.orderItem.findMany({
    where: { measurementId: null },
    include: { order: true }
  });

  for (const item of items) {
    const userId = item.order.userId;
    // create a default measurement for the user
    const measurement = await prisma.measurement.create({
      data: {
        userId: userId,
        name: 'Auto-generated Measurements',
        chest: 40,
        waist: 34,
        hip: 41,
        shoulder: 18,
        sleeveLength: 25,
        neckSize: 16,
        height: 70
      }
    });

    // update item
    await prisma.orderItem.update({
      where: { id: item.id },
      data: { measurementId: measurement.id }
    });
    console.log(`Updated item ${item.id} with measurement ${measurement.id}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
