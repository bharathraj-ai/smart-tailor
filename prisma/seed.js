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



    console.log('Supabase database seeded successfully!');
  } catch (e) {
    console.error('Error during seeding:', e.message);
    process.exit(1);
  }
}

main();
