import { Prisma } from '@prisma/client';

export type QuizWithQuestions = Prisma.QuizGetPayload<{
  include: { questions: true };
}>;
