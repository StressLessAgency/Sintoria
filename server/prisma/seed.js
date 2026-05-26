import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('testpass123', 12);

  // Test user 1
  const user1 = await prisma.user.upsert({
    where: { email: 'player1@test.com' },
    update: {},
    create: {
      email: 'player1@test.com',
      username: 'player_one',
      passwordHash,
      dateOfBirth: new Date('1995-06-15'),
      isVerified: true,
      kycStatus: 'APPROVED',
      wallet: { create: { balanceCents: 50000 } }, // $500
      responsibleGambling: { create: {} },
    },
  });

  // Test user 2
  const user2 = await prisma.user.upsert({
    where: { email: 'player2@test.com' },
    update: {},
    create: {
      email: 'player2@test.com',
      username: 'player_two',
      passwordHash,
      dateOfBirth: new Date('1990-03-22'),
      isVerified: true,
      kycStatus: 'APPROVED',
      wallet: { create: { balanceCents: 50000 } }, // $500
      responsibleGambling: { create: {} },
    },
  });

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@threes.game' },
    update: {},
    create: {
      email: 'admin@threes.game',
      username: 'admin',
      passwordHash,
      dateOfBirth: new Date('1988-01-01'),
      isVerified: true,
      isAdmin: true,
      kycStatus: 'APPROVED',
      wallet: { create: { balanceCents: 100000 } }, // $1000
      responsibleGambling: { create: {} },
    },
  });

  console.log('Seeded users:');
  console.log(`  player1@test.com / testpass123 (balance: $500)`);
  console.log(`  player2@test.com / testpass123 (balance: $500)`);
  console.log(`  admin@threes.game / testpass123 (admin, balance: $1000)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
