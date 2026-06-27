import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();

    // Check if user already exists
    const { data: existingUsers } = await db
      .from('users')
      .select('*')
      .or(`email.eq.${email},phone.eq.${phone}`);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this email or phone already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: insertError } = await db
      .from('users')
      .insert([
        {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'customer',
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
