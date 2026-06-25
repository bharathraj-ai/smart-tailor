require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding the database...');

  // 1. Create a Tailor Account
  const tailor = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      name: 'Master Tailor',
      email: 'tailor@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '9876543210',
      role: 'tailor',
      address: '123 Fashion Street, City',
    },
  });

  // 2. Create Customer 1 (Rahul)
  const rahul = await prisma.user.upsert({
    where: { phone: '1234567890' },
    update: {},
    create: {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '1234567890',
      role: 'customer',
      address: '456 Tech Park, City',
      measurements: {
        create: {
          name: 'Default Measurements',
          chest: 38,
          waist: 32,
          hip: 39,
          shoulder: 18,
          sleeveLength: 25,
          neckSize: 15.5,
          height: 70,
        }
      }
    },
  });

  // 3. Create Customer 2 (Priya)
  const priya = await prisma.user.upsert({
    where: { phone: '0987654321' },
    update: {},
    create: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '0987654321',
      role: 'customer',
      address: '789 Design Ave, City',
      measurements: {
        create: {
          name: 'Blouse Measurements',
          chest: 34,
          waist: 28,
          shoulder: 15,
        }
      }
    },
  });

  // 4. Create Customer 3 (Amit)
  const amit = await prisma.user.upsert({
    where: { phone: '1122334455' },
    update: {},
    create: {
      name: 'Amit Kumar',
      email: 'amit.kumar@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '1122334455',
      role: 'customer',
      address: '101 Executive Blvd, City',
      measurements: {
        create: {
          name: 'Suit Measurements',
          chest: 40,
          waist: 34,
          hip: 41,
          shoulder: 19,
          sleeveLength: 26,
        }
      }
    },
  });

  // Fetch measurements to link to orders
  const rahulMeasurement = await prisma.measurement.findFirst({ where: { userId: rahul.id } });
  const priyaMeasurement = await prisma.measurement.findFirst({ where: { userId: priya.id } });
  const amitMeasurement = await prisma.measurement.findFirst({ where: { userId: amit.id } });

  // 5. Create Orders
  await prisma.order.create({
    data: {
      userId: rahul.id,
      status: 'Order Received',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      totalAmount: 1299,
      deliveryType: 'Delivery',
      items: {
        create: {
          category: 'Custom Shirt (Cotton)',
          measurementId: rahulMeasurement?.id,
        }
      }
    }
  });

  await prisma.order.create({
    data: {
      userId: priya.id,
      status: 'In Stitching',
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      totalAmount: 2499,
      deliveryType: 'Pickup',
      items: {
        create: {
          category: 'Designer Blouse',
          measurementId: priyaMeasurement?.id,
        }
      }
    }
  });

  await prisma.order.create({
    data: {
      userId: amit.id,
      status: 'Ready for Delivery',
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      totalAmount: 8999,
      deliveryType: 'Delivery',
      items: {
        create: {
          category: "Men's Suit (Wool)",
          measurementId: amitMeasurement?.id,
        }
      }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
