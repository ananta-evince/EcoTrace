import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash('SecurePass123!', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@ecotrace.app' },
    update: {},
    create: {
      email: 'demo@ecotrace.app',
      name: 'Demo User',
      passwordHash,
      country: 'GB',
      householdSize: 2,
      dietType: 'omnivore',
      carOwnership: true,
      vehicleType: 'car_petrol',
      heatingType: 'gas',
      monthlyEnergy: 250,
      homeSize: 85,
      onboarding: {
        create: { step: 3, completed: true },
      },
    },
  });

  await prisma.carbonEntry.createMany({
    data: [
      {
        userId: demoUser.id,
        category: 'transport',
        subcategory: 'car_petrol',
        value: 25,
        unit: 'km',
        kgCO2e: 4.3,
        date: new Date(),
      },
      {
        userId: demoUser.id,
        category: 'food',
        subcategory: 'omnivore_meal',
        value: 2,
        unit: 'meals',
        kgCO2e: 5.6,
        date: new Date(),
      },
    ],
  });

  console.log('Seed completed:', demoUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
