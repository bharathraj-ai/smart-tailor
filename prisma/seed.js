require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in env");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Seeding the Supabase database...');
  try {
    // Clean up existing data (foreign keys are configured to CASCADE delete)
    console.log('Cleaning up existing user data...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('email', 'nonexistent_email_to_delete_all@test.com');

    if (deleteError) {
      console.error('Error cleaning up database:', deleteError.message);
    }

    // 1. Create a Tailor Account
    const hashedPasswordTailor = await bcrypt.hash('admin@123', 10);
    const { data: tailor, error: tailorError } = await supabase
      .from('users')
      .insert({
        name: 'Admin Tailor',
        email: 'admin123@gmail.com',
        password: hashedPasswordTailor,
        phone: '9876543210',
        role: 'tailor',
        address: '123 Fashion Street, City',
      })
      .select()
      .single();

    if (tailorError) throw tailorError;
    console.log('Created Tailor Admin account:', tailor.email);

    // 2. Create Customer 1 (Rahul)
    const hashedPasswordRahul = await bcrypt.hash('password123', 10);
    const { data: rahul, error: rahulError } = await supabase
      .from('users')
      .insert({
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        password: hashedPasswordRahul,
        phone: '1234567890',
        role: 'customer',
        address: '456 Tech Park, City',
      })
      .select()
      .single();

    if (rahulError) throw rahulError;
    console.log('Created Rahul:', rahul.email);

    const { data: rahulMeasurement, error: rmError } = await supabase
      .from('measurements')
      .insert({
        userId: rahul.id,
        name: 'Default Measurements',
        chest: 38, waist: 32, hip: 39,
        shoulder: 18, sleeveLength: 25,
        neckSize: 15.5, height: 70,
      })
      .select()
      .single();

    if (rmError) throw rmError;

    // 3. Create Customer 2 (Priya)
    const hashedPasswordPriya = await bcrypt.hash('password123', 10);
    const { data: priya, error: priyaError } = await supabase
      .from('users')
      .insert({
        name: 'Priya Patel',
        email: 'priya.patel@example.com',
        password: hashedPasswordPriya,
        phone: '0987654321',
        role: 'customer',
        address: '789 Design Ave, City',
      })
      .select()
      .single();

    if (priyaError) throw priyaError;
    console.log('Created Priya:', priya.email);

    const { data: priyaMeasurement, error: pmError } = await supabase
      .from('measurements')
      .insert({
        userId: priya.id,
        name: 'Blouse Measurements',
        chest: 34, waist: 28, shoulder: 15,
      })
      .select()
      .single();

    if (pmError) throw pmError;

    // 4. Create Customer 3 (Amit)
    const hashedPasswordAmit = await bcrypt.hash('password123', 10);
    const { data: amit, error: amitError } = await supabase
      .from('users')
      .insert({
        name: 'Amit Kumar',
        email: 'amit.kumar@example.com',
        password: hashedPasswordAmit,
        phone: '1122334455',
        role: 'customer',
        address: '101 Executive Blvd, City',
      })
      .select()
      .single();

    if (amitError) throw amitError;
    console.log('Created Amit:', amit.email);

    const { data: amitMeasurement, error: amError } = await supabase
      .from('measurements')
      .insert({
        userId: amit.id,
        name: 'Suit Measurements',
        chest: 40, waist: 34, hip: 41,
        shoulder: 19, sleeveLength: 26,
      })
      .select()
      .single();

    if (amError) throw amError;

    // 5. Create Orders
    const { data: order1, error: o1Error } = await supabase
      .from('orders')
      .insert({
        userId: rahul.id,
        status: 'Order Received',
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        totalAmount: 1299,
        deliveryType: 'Delivery',
      })
      .select()
      .single();

    if (o1Error) throw o1Error;

    const { error: oi1Error } = await supabase
      .from('orderItems')
      .insert({
        orderId: order1.id,
        category: 'Custom Shirt (Cotton)',
        measurementId: rahulMeasurement.id,
      });

    if (oi1Error) throw oi1Error;

    const { data: order2, error: o2Error } = await supabase
      .from('orders')
      .insert({
        userId: priya.id,
        status: 'In Stitching',
        paymentMethod: 'Razorpay',
        paymentStatus: 'Paid',
        totalAmount: 2499,
        deliveryType: 'Pickup',
      })
      .select()
      .single();

    if (o2Error) throw o2Error;

    const { error: oi2Error } = await supabase
      .from('orderItems')
      .insert({
        orderId: order2.id,
        category: 'Designer Blouse',
        measurementId: priyaMeasurement.id,
      });

    if (oi2Error) throw oi2Error;

    const { data: order3, error: o3Error } = await supabase
      .from('orders')
      .insert({
        userId: amit.id,
        status: 'Ready for Delivery',
        paymentMethod: 'Razorpay',
        paymentStatus: 'Paid',
        totalAmount: 8999,
        deliveryType: 'Delivery',
      })
      .select()
      .single();

    if (o3Error) throw o3Error;

    const { error: oi3Error } = await supabase
      .from('orderItems')
      .insert({
        orderId: order3.id,
        category: "Men's Suit (Wool)",
        measurementId: amitMeasurement.id,
      });

    if (oi3Error) throw oi3Error;

    console.log('Supabase database seeded successfully!');
  } catch (e) {
    console.error('Error during seeding:', e.message);
    process.exit(1);
  }
}

main();
