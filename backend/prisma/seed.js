import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load env configuration dynamically relative to this seed file
dotenv.config({ path: new URL('../.env', import.meta.url) });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const usersToSeed = [
    {
      email: 'admin@transitops.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'ADMIN'
    },
    {
      email: 'fleet@transitops.com',
      password: 'transitops123',
      name: 'Meera Shah',
      role: 'FLEET_MANAGER'
    },
    {
      email: 'dispatcher@transitops.com',
      password: 'transitops123',
      name: 'Rahul Patel',
      role: 'DISPATCHER'
    },
    {
      email: 'safety@transitops.com',
      password: 'transitops123',
      name: 'Nisha Rao',
      role: 'SAFETY_OFFICER'
    },
    {
      email: 'finance@transitops.com',
      password: 'transitops123',
      name: 'Amit Desai',
      role: 'FINANCIAL_ANALYST'
    }
  ];

  for (const u of usersToSeed) {
    const existing = await prisma.user.findUnique({
      where: { email: u.email }
    });

    if (!existing) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const user = await prisma.user.create({
        data: {
          email: u.email,
          password: hashedPassword,
          name: u.name,
          role: u.role,
          isActive: true
        }
      });
      console.log(`✅ User created: ${user.email} (Role: ${user.role}, Password: ${u.password})`);
    } else {
      console.log(`ℹ️ User already exists: ${u.email}`);
    }
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
