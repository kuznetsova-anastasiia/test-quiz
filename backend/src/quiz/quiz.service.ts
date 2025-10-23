import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizWithQuestions } from '../utils/types';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto): Promise<QuizWithQuestions> {
    const { questions, ...quizData } = createQuizDto;

    return await this.prisma.quiz.create({
      data: {
        ...quizData,
        questions: {
          create: questions.map((question) => ({
            ...question,
            options: question.options ? JSON.stringify(question.options) : null,
            correctAnswers: question.correctAnswers
              ? JSON.stringify(question.correctAnswers)
              : null,
          })),
        },
      },
      include: {
        questions: true,
      },
    });
  }

  async findAll() {
    return this.prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const questionsWithParsedData = quiz.questions.map((question) => ({
      ...question,
      options: question.options
        ? (JSON.parse(question.options) as string[])
        : null,
      correctAnswers: question.correctAnswers
        ? (JSON.parse(question.correctAnswers) as (string | boolean)[])
        : null,
    }));

    return {
      ...quiz,
      questions: questionsWithParsedData,
    };
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const { questions, ...quizData } = updateQuizDto;

    if (questions && Array.isArray(questions)) {
      await this.prisma.question.deleteMany({
        where: { quizId: id },
      });

      return this.prisma.quiz.update({
        where: { id },
        data: {
          ...quizData,
          questions: {
            create: questions.map((question) => ({
              ...question,
              options: question.options
                ? JSON.stringify(question.options)
                : null,
              correctAnswers: question.correctAnswers
                ? JSON.stringify(question.correctAnswers)
                : null,
            })),
          },
        },
        include: {
          questions: true,
        },
      });
    }

    return this.prisma.quiz.update({
      where: { id },
      data: quizData,
      include: {
        questions: true,
      },
    });
  }

  async remove(id: string) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return this.prisma.quiz.delete({
      where: { id },
    });
  }
}
