import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: 'john@mail.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@mail.com',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@mail.com' },
    update: {},
    create: {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@mail.com',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'amber@mail.com' },
    update: {},
    create: {
      firstName: 'Amber',
      lastName: 'Johnson',
      email: 'amber@mail.com',
      role: 'ADMIN',
    },
  });

  const article1 = await prisma.article.upsert({
    where: { id: 1 },
    update: {
      userId: user3.id,
    },
    create: {
      title: "What's new in Prisma?",
      content:
        'Our engineers have been working hard, issuing new releases with many improvements...',
      userId: user3.id,
    },
  });

  const article2 = await prisma.article.upsert({
    where: { id: 2 },
    update: {
      userId: user3.id,
    },
    create: {
      title: 'GraphQL is the best',
      content:
        'I really like GraphQL because it allows me to request only the data I need...',
      userId: user3.id,
    },
  });

  const article3 = await prisma.article.upsert({
    where: { id: 3 },
    update: {
      userId: user2.id,
    },
    create: {
      title: 'REST is the best',
      content:
        'I really like REST because it allows me to request only the data I need...',
      userId: user2.id,
    },
  });

  console.log({ user1, user2, user3, article1, article2, article3 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
