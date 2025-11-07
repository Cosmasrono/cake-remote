import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('22360010sS$', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'ccosmas001@gmail.com',
        password: hashedPassword,
        role: 'admin',
      },
    });
    
    console.log('✅ Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: 22360010sS$');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Admin user already exists!');
    } else {
      console.error('❌ Error creating admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();