const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker'); // Import faker properly
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up existing data...");

  // Delete in the correct order to avoid foreign key issues
  await prisma.comment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.report.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.user.deleteMany();
  await prisma.template.deleteMany();
  await prisma.tag.deleteMany();

  console.log("Seeding new data...");

  // Create a single user
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
  

  // Create templates
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

  console.log("Templates created successfully!");

  // Create 40 users
  console.log("Creating 40 users...");
  for (let i = 0; i < 40; i++) {
    await prisma.user.create({
      data: {
        first_name: "hi",
        last_name: "us",
        username: `${i}`,
        email: `${i}@gmail.com`,
        password: "faker.internet.password(12)", // Generates a 12-character password
        phone_number: "11111111111", // Random phone number
        avatar: "/uploads/avatars/avatar1.png",
      },
    });
  }

  for (let i = 1; i <= 40; i++) {
    await prisma.blogPost.create({
      data: {
        title: "hi",
        description: "ha",
        content: "a",
        author: { connect: { id: user.id } },
        
      },
    });
  }
  for (let i = 1; i <= 40; i++) {
    await prisma.blogPost.create({
      data: {
        title: "hi",
        description: "ha",
        content: "a",
        author: { connect: { id: user.id } },
        
      },
    });
  }
  for (let i = 1; i <= 20; i++) {
    await prisma.blogPost.create({
      data: {
        title: "hi",
        description: "ha",
        content: "a",
        author: { connect: { id: user.id } },
        
      },
    });
  }
  for (let i = 1; i <= 10; i++) {
    await prisma.blogPost.create({
      data: {
        title: "hi",
        description: "ha",
        content: "a",
        author: { connect: { id: user.id } },
        tags: {
          connectOrCreate: [
            { where: { name: "tech" }, create: { name: "tech" } },
            { where: { name: "programming" }, create: { name: "programming" } },
          ],
        },
        
      },
    });
  }

    // Randomly select a template ID (from the array of created templates)
    //const randomTemplateId = templateIds[Math.floor(Math.random() * templateIds.length)];

    


  // Create 40 templates
  console.log("Creating 40 templates...");
  for (let i = 0; i < 40; i++) {
    const templateData = {
      title: faker.lorem.sentence(),
      code: `print(${i + 1})`,
      description: faker.lorem.paragraph(),
      language: faker.helpers.arrayElement(["Python", "JavaScript", "C", "Java"]),
      tags: faker.helpers.arrayElements(["programming", "tutorial", "sample", "example", "coding", "algorithm"], 3),
    };

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




  // console.log("40 users created successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
