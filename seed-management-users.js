const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedManagementUsers() {
  try {
    console.log('Seeding management users...');

    // Create sample management users
    const users = [
      {
        employeeId: 'ECZ001',
        firstName: 'John',
        lastName: 'Mwanza',
        email: 'john.mwanza@ecz.gov.zm',
        passwordHash: 'admin123', // In production, this should be properly hashed
        role: 'admin'
      },
      {
        employeeId: 'ECZ002',
        firstName: 'Mary',
        lastName: 'Banda',
        email: 'mary.banda@ecz.gov.zm',
        passwordHash: 'supervisor123',
        role: 'supervisor'
      },
      {
        employeeId: 'ECZ003',
        firstName: 'Peter',
        lastName: 'Tembo',
        email: 'peter.tembo@ecz.gov.zm',
        passwordHash: 'operator123',
        role: 'operator'
      }
    ];

    for (const user of users) {
      const existingUser = await prisma.managementUsers.findUnique({
        where: { employeeId: user.employeeId }
      });

      if (!existingUser) {
        await prisma.managementUsers.create({
          data: user
        });
        console.log(`Created user: ${user.firstName} ${user.lastName} (${user.employeeId})`);
      } else {
        console.log(`User ${user.employeeId} already exists, skipping...`);
      }
    }

    console.log('Management users seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: ECZ001 / admin123');
    console.log('Supervisor: ECZ002 / supervisor123');
    console.log('Operator: ECZ003 / operator123');

  } catch (error) {
    console.error('Error seeding management users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedManagementUsers();
