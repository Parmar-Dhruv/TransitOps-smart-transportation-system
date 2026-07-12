import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const adminEmail = 'admin@transitops.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log(`✅ Default admin user created: ${admin.email} (Password: admin123)`);
  } else {
    console.log('ℹ️ Default admin user already exists.');
  }

  console.log('🌱 Seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
