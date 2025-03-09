const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
import { faker } from '@faker-js/faker';


async function main() {
  console.log("Cleaning up existing data...");

  // Delete in the correct order to avoid foreign key issues
  await prisma.template.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding new data...");

  const user = await prisma.user.create({
    data: {
      first_name: "Eren",
      last_name: "Yeager",
      username: `freedom_fighter_${Date.now()}`,
      email: `eren.yeager.${Date.now()}@example.com`,
      password: "freedom",
      avatar: "/uploads/avatars/avatar1.png",
      phone_number: "123-456-7890",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      first_name: "pls",
      last_name: "wprd",
      username: `god${Date.now()}`,
      email: `eren.a.${Date.now()}@example.com`,
      password: "a",
      avatar: "/uploads/avatars/avatar1.png",
      phone_number: "123-456-7890",
    },
  });

  const templates = [
    {
      title: "Hello World in Python",
      code: 'print("Hello, World!")',
      description: "A simple hello world template in Python",
      language: "Python",
      tags: ["hello", "world", "python"],
    },
    {
      title: "Factorial in C",
      code: `
  #include <stdio.h>
  int factorial(int n) { if (n == 0) return 1; return n * factorial(n - 1); }
  int main() { int n; printf("Enter a number: "); scanf("%d", &n); printf("Factorial of %d is %d", n, factorial(n)); return 0; }`,
        description: "A program to compute factorial using recursion in C",
        language: "C",
        tags: ["factorial", "recursion", "c"],
      },
    ];

    for (const templateData of templates) {
      await prisma.template.create({
        data: {
          ...templateData,
          author: { connect: { id: user.id } }, // Link template to the user
          tags: {
            connectOrCreate: templateData.tags.map((tag) => ({
              where: { name: tag.toLowerCase() },
              create: { name: tag.toLowerCase() },
            })),
          },
        },
      });
    }

    console.log("Seeding completed successfully!");
  }
  for (let i = 0; i < 40; i++) {
    await prisma.user.create({
      data: {
        first_name: "faker.name.firstName()",
        last_name: "faker.name.lastName()",
        username: "faker.internet.userName()",
        email: "faker.internet.email()",
        password: "faker.internet.password(12)", // Generates a 12-character password
        phone_number: "11111111111", // U.S.-style phone number
        avatar: "/uploads/avatars/avatar1.png", // Random avatar (1–10 // Random true/false for admin status
      },
    });
  }

  console.log('40 users created successfully!');


  main()
    .catch((e) => {
      console.error("Error during seeding:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
