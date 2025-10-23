const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function main() {
  console.log('Setting up database...');
  
  // Create some sample data
  const quiz = await prisma.quiz.create({
    data: {
      title: 'JavaScript Fundamentals',
      questions: {
        create: [
          {
            type: 'BOOLEAN',
            text: 'JavaScript is a statically typed language.',
            correctAnswers: JSON.stringify([false]),
            required: true,
          },
          {
            type: 'INPUT',
            text: 'What keyword is used to declare a variable in JavaScript?',
            correctAnswers: JSON.stringify(['var', 'let', 'const']),
            required: true,
          },
          {
            type: 'CHECKBOX',
            text: 'Which of the following are JavaScript data types?',
            options: JSON.stringify(['String', 'Number', 'Boolean', 'Array', 'Object']),
            correctAnswers: JSON.stringify([true, true, true, true, true]),
            required: true,
          },
        ],
      },
    },
  });

  console.log('Sample quiz created:', quiz);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
