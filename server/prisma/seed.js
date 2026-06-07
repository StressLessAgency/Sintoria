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
    update: { isAdmin: true, role: 'ADMIN', isVerified: true },
    create: {
      email: 'admin@threes.game',
      username: 'admin',
      passwordHash,
      dateOfBirth: new Date('1988-01-01'),
      isVerified: true,
      isAdmin: true,
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      wallet: { create: { balanceCents: 100000 } }, // 100,000 chips
      responsibleGambling: { create: {} },
    },
  });

  // Bryan — Stressless owner
  const bryan = await prisma.user.upsert({
    where: { email: 'bryan@stressfreerecords.com' },
    update: { isAdmin: true, role: 'ADMIN', isVerified: true, kycStatus: 'APPROVED' },
    create: {
      email: 'bryan@stressfreerecords.com',
      username: 'bryan',
      passwordHash,
      dateOfBirth: new Date('1990-01-01'),
      isVerified: true,
      isAdmin: true,
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      wallet: { create: { balanceCents: 100000 } }, // 100,000 chips
      responsibleGambling: { create: {} },
    },
  });

  // HOUSE system user — rake transactions reference this row so the
  // Transaction.userId foreign key holds. Suspended so it can never log in.
  const house = await prisma.user.upsert({
    where: { id: 'house' },
    update: {},
    create: {
      id: 'house',
      email: 'house@system.local',
      username: '__house__',
      passwordHash: await bcrypt.hash(`house-${Date.now()}-${Math.random()}`, 12),
      dateOfBirth: new Date('1970-01-01'),
      isVerified: true,
      isSuspended: true,
      isAdmin: false,
      role: 'PLAYER',
      kycStatus: 'APPROVED',
    },
  });

  console.log('Seeded users:');
  console.log(`  player1@test.com / testpass123 (5,000 chips after welcome grant)`);
  console.log(`  player2@test.com / testpass123 (5,000 chips after welcome grant)`);
  console.log(`  admin@threes.game / testpass123 (admin, 100,000 chips)`);
  console.log(`  bryan@stressfreerecords.com / testpass123 (admin, 100,000 chips)`);
  console.log(`  house (system) — rake recipient, suspended`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
