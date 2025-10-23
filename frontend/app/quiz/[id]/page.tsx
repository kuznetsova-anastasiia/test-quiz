'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Play,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Quiz, QuestionType, QuizFormData, Question } from '@/types/quiz';
import { quizAPI } from '@/lib/api';
import {
  useForm,
  useFieldArray,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type QuizState = 'preview' | 'taking' | 'completed' | 'editing';
type UserAnswer = string | boolean | string[];

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['BOOLEAN', 'INPUT', 'CHECKBOX']),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).optional().nullable(),
  correctAnswers: z
    .array(z.union([z.string(), z.boolean()]))
    .optional()
    .nullable(),
  required: z.boolean(),
});

const quizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required'),
  questions: z
    .array(questionSchema)
    .min(1, 'At least one question is required'),
});

interface QuizTakingInterfaceProps {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  userAnswers: Record<string, UserAnswer>;
  handleAnswerChange: (questionId: string, answer: UserAnswer) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
}

const QuizTakingInterface = ({
  quiz,
  currentQuestionIndex,
  userAnswers,
  handleAnswerChange,
  nextQuestion,
  previousQuestion,
  submitQuiz,
  resetQuiz,
}: QuizTakingInterfaceProps) => {
  if (!quiz) return null;

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  if (!currentQuestion) return null;
  const isLastQuestion =
    currentQuestionIndex === (quiz.questions?.length || 0) - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentAnswer = userAnswers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-amber-900 mb-2">
                {quiz.title}
              </h1>
              <p className="text-amber-700 text-lg">
                Question {currentQuestionIndex + 1} of{' '}
                {quiz.questions?.length || 0}
              </p>
            </div>
            <button
              onClick={resetQuiz}
              className="text-amber-600 hover:text-amber-800 flex items-center font-medium cursor-pointer"
            >
              <ArrowLeft size={20} className="mr-2" />
              Exit Quiz
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-amber-200 rounded-full h-3">
            <div
              className="bg-amber-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              {currentQuestion.required && (
                <span className="px-4 py-2 text-sm bg-red-100 text-red-800 rounded-full font-medium">
                  Required
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Question Input */}
          {currentQuestion.type === 'BOOLEAN' && (
            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer transition-colors">
                <input
                  key={`radio-true-${currentQuestion.id}`}
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={currentAnswer === true}
                  onChange={() => handleAnswerChange(currentQuestion.id, true)}
                  className="mr-4 w-5 h-5"
                />
                <span className="text-xl text-amber-900">True</span>
              </label>
              <label className="flex items-center p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer transition-colors">
                <input
                  key={`radio-false-${currentQuestion.id}`}
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={currentAnswer === false}
                  onChange={() => handleAnswerChange(currentQuestion.id, false)}
                  className="mr-4 w-5 h-5"
                />
                <span className="text-xl text-amber-900">False</span>
              </label>
            </div>
          )}

          {currentQuestion.type === 'INPUT' && (
            <div>
              <input
                key={`input-${currentQuestion.id}`}
                type="text"
                value={(currentAnswer as string) || ''}
                onChange={e =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
                placeholder="Enter your answer here..."
                className="w-full px-6 py-4 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xl bg-amber-50 text-black"
              />
            </div>
          )}

          {currentQuestion.type === 'CHECKBOX' && currentQuestion.options && (
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isChecked =
                  Array.isArray(currentAnswer) &&
                  (currentAnswer as unknown as boolean[])[index] === true;
                return (
                  <label
                    key={index}
                    className="flex items-center p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 cursor-pointer transition-colors"
                  >
                    <input
                      key={`checkbox-${currentQuestion.id}-${index}`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => {
                        const newAnswer = Array.isArray(currentAnswer)
                          ? [...currentAnswer]
                          : new Array(currentQuestion.options!.length).fill(
                              false
                            );
                        newAnswer[index] = e.target.checked;
                        handleAnswerChange(currentQuestion.id, newAnswer);
                      }}
                      className="mr-4 w-5 h-5"
                    />
                    <span className="text-xl text-amber-900">{option}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={isFirstQuestion}
            className={`flex items-center px-6 py-3 rounded-xl font-semibold ${
              isFirstQuestion
                ? 'bg-amber-100 text-amber-400 cursor-not-allowed'
                : 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
            }`}
          >
            <ArrowLeftIcon size={20} className="mr-2" />
            Previous
          </button>

          <div className="flex space-x-4">
            {isLastQuestion ? (
              <button
                onClick={submitQuiz}
                className="flex items-center px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold shadow-lg"
              >
                <CheckCircle size={20} className="mr-2" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="flex items-center px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold shadow-lg"
              >
                Next
                <ArrowRight size={20} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CheckboxQuestionEditProps {
  index: number;
  register: UseFormRegister<QuizFormData>;
  errors: FieldErrors<QuizFormData>;
  setValue: UseFormSetValue<QuizFormData>;
  questionType: string;
}

const CheckboxQuestionEdit = memo(
  ({
    index,
    register,
    errors,
    setValue,
    questionType,
  }: CheckboxQuestionEditProps) => {
    const [localOptions, setLocalOptions] = useState<string[]>(['']);

    // Only render if question type is CHECKBOX
    if (questionType !== 'CHECKBOX') {
      return null;
    }

    const addOption = () => {
      const newOptions = [...localOptions, ''];
      setLocalOptions(newOptions);
      setValue(`questions.${index}.options`, newOptions);
    };

    const removeOption = (optionIndex: number) => {
      if (localOptions.length > 1) {
        const newOptions = localOptions.filter(
          (_: string, i: number) => i !== optionIndex
        );
        setLocalOptions(newOptions);
        setValue(`questions.${index}.options`, newOptions);
      }
    };

    const updateOption = (optionIndex: number, value: string) => {
      const newOptions = [...localOptions];
      newOptions[optionIndex] = value;
      setLocalOptions(newOptions);
      setValue(`questions.${index}.options`, newOptions);
    };

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text
          </label>
          <input
            key={`edit-question-text-${index}`}
            {...register(`questions.${index}.text`)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Enter your question..."
          />
          {errors.questions?.[index]?.text && (
            <p className="text-red-500 text-sm mt-1">
              {errors.questions[index].text.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Answer Options
          </label>
          <div className="space-y-2">
            {localOptions.map((option: string, optionIndex: number) => (
              <div
                key={`edit-q${index}-opt${optionIndex}`}
                className="flex items-center space-x-2"
              >
                <input
                  key={`edit-option-${index}-${optionIndex}`}
                  type="text"
                  value={option}
                  onChange={e => updateOption(optionIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder={`Option ${optionIndex + 1}`}
                />
                <input
                  key={`edit-checkbox-${index}-${optionIndex}`}
                  type="checkbox"
                  {...register(
                    `questions.${index}.correctAnswers.${optionIndex}`
                  )}
                  className="mr-1 text-black"
                />
                <span className="text-sm text-gray-600">Correct</span>
                {localOptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeOption(optionIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Add Option
          </button>
        </div>

        <div className="flex items-center">
          <input
            key={`edit-required-${index}`}
            type="checkbox"
            {...register(`questions.${index}.required`)}
            className="mr-2"
          />
          <label className="text-sm text-gray-700">Required question</label>
        </div>
      </div>
    );
  }
);

CheckboxQuestionEdit.displayName = 'CheckboxQuestionEdit';

export default function QuizDetailsPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizState, setQuizState] = useState<QuizState>('preview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(
    {}
  );
  const [quizScore, setQuizScore] = useState<{
    correct: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const foundQuiz = await quizAPI.getQuiz(params.id as string);
        setQuiz(foundQuiz);
      } catch (error) {
        console.error('Error loading quiz:', error);
        setQuiz(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadQuiz();
    }
  }, [params.id]);

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  const startQuiz = () => {
    setQuizState('taking');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizScore(null);
  };

  const handleAnswerChange = (questionId: string, answer: UserAnswer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const nextQuestion = () => {
    if (
      quiz &&
      quiz.questions &&
      currentQuestionIndex < quiz.questions.length - 1
    ) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    if (!quiz) return;

    let correct = 0;
    const total = quiz.questions?.length || 0;

    quiz.questions?.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const correctAnswer = question.correctAnswers;

      if (question.type === 'BOOLEAN') {
        const userAnswerBool = userAnswer === true || userAnswer === 'true';
        const correctAnswerBool =
          correctAnswer?.[0] === true || correctAnswer?.[0] === 'true';
        if (userAnswerBool === correctAnswerBool) {
          correct++;
        }
      } else if (question.type === 'INPUT') {
        const userAnswerStr = String(userAnswer).toLowerCase().trim();
        const correctAnswers =
          correctAnswer?.map(ans => String(ans).toLowerCase().trim()) || [];
        if (correctAnswers.includes(userAnswerStr)) {
          correct++;
        }
      } else if (question.type === 'CHECKBOX') {
        const userAnswersArray = Array.isArray(userAnswer) ? userAnswer : [];
        const correctAnswersArray = correctAnswer || [];
        const isCorrect =
          userAnswersArray.length === correctAnswersArray.length &&
          userAnswersArray.every(
            (answer, index) => answer === correctAnswersArray[index]
          );
        if (isCorrect) {
          correct++;
        }
      }
    });

    const percentage = Math.round((correct / total) * 100);
    setQuizScore({ correct, total, percentage });
    setQuizState('completed');
  };

  const resetQuiz = () => {
    setQuizState('preview');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizScore(null);
  };

  const startEditing = () => {
    if (!quiz) return;

    reset({
      title: quiz.title,
      questions:
        quiz.questions?.map(q => ({
          ...q,
          options: q.options || [],
          correctAnswers: q.correctAnswers || [],
        })) || [],
    });

    setQuizState('editing');
  };

  const cancelEditing = () => {
    setQuizState('preview');
    setShowQuestionTypes(false);
  };

  const saveQuiz = async (data: QuizFormData) => {
    if (!quiz) return;

    setIsSaving(true);
    try {
      const updateData = {
        title: data.title,
        questions: data.questions.map((question: Question) => ({
          type: question.type.toUpperCase() as 'BOOLEAN' | 'INPUT' | 'CHECKBOX',
          text: question.text,
          options: question.options || undefined,
          correctAnswers: question.correctAnswers || undefined,
          required: question.required,
        })),
      };

      const updatedQuiz = await quizAPI.updateQuiz(quiz.id!, updateData);
      setQuiz(updatedQuiz);
      setQuizState('preview');
    } catch (error) {
      console.error('Error saving quiz:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = (type: QuestionType) => {
    append({
      id: crypto.randomUUID(),
      type,
      text: '',
      required: true,
      options: type === 'CHECKBOX' ? [''] : undefined,
      correctAnswers:
        type === 'BOOLEAN' ? [false] : type === 'INPUT' ? [''] : [],
    });
    setShowQuestionTypes(false);
  };

  const removeQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowQuestionTypes(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const QuizResultsInterface = useCallback(() => {
    if (!quiz || !quizScore) return null;

    const getScoreColor = (percentage: number) => {
      if (percentage >= 80) return 'text-green-600';
      if (percentage >= 60) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreMessage = (percentage: number) => {
      if (percentage >= 90) return 'Excellent work!';
      if (percentage >= 80) return 'Great job!';
      if (percentage >= 70) return 'Good effort!';
      if (percentage >= 60) return 'Not bad, keep studying!';
      return 'Keep practicing!';
    };

    return (
      <div className="min-h-screen bg-amber-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-8 text-center mb-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-amber-900 mb-4">
                Quiz Complete!
              </h1>
              <p className="text-amber-700 text-xl">{quiz.title}</p>
            </div>

            <div className="mb-10">
              <div
                className={`text-8xl font-bold ${getScoreColor(quizScore.percentage)} mb-4`}
              >
                {quizScore.percentage}%
              </div>
              <p className="text-2xl text-amber-700 mb-4">
                {quizScore.correct} out of {quizScore.total} questions correct
              </p>
              <p className="text-xl text-amber-600">
                {getScoreMessage(quizScore.percentage)}
              </p>
            </div>

            <div className="flex justify-center space-x-6">
              <button
                onClick={resetQuiz}
                className="px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center font-semibold text-lg shadow-lg cursor-pointer"
              >
                <Play size={24} className="mr-2" />
                Retake Quiz
              </button>
              <Link
                href="/quizzes"
                className="px-8 py-4 bg-amber-200 text-amber-900 rounded-xl hover:bg-amber-300 flex items-center font-semibold text-lg shadow-lg"
              >
                <ArrowLeft size={24} className="mr-2" />
                Back to Quizzes
              </Link>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Question Review
            </h2>
            <div className="space-y-4">
              {quiz.questions?.map((question, index) => {
                const userAnswer = userAnswers[question.id];
                const isCorrect = (() => {
                  if (question.type === 'BOOLEAN') {
                    const userAnswerBool =
                      userAnswer === true || userAnswer === 'true';
                    const correctAnswerBool =
                      question.correctAnswers?.[0] === true ||
                      question.correctAnswers?.[0] === 'true';
                    return userAnswerBool === correctAnswerBool;
                  } else if (question.type === 'INPUT') {
                    const userAnswerStr = String(userAnswer)
                      .toLowerCase()
                      .trim();
                    const correctAnswers =
                      question.correctAnswers?.map(ans =>
                        String(ans).toLowerCase().trim()
                      ) || [];
                    return correctAnswers.includes(userAnswerStr);
                  } else if (question.type === 'CHECKBOX') {
                    const userAnswersArray = Array.isArray(userAnswer)
                      ? userAnswer
                      : [];
                    const correctAnswersArray = question.correctAnswers || [];
                    return (
                      userAnswersArray.length === correctAnswersArray.length &&
                      userAnswersArray.every(
                        (answer, idx) => answer === correctAnswersArray[idx]
                      )
                    );
                  }
                  return false;
                })();

                return (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        Question {index + 1}
                      </h3>
                      <div className="flex items-center">
                        {isCorrect ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <XCircle size={20} className="text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{question.text}</p>
                    <div className="text-sm">
                      <p className="text-gray-600">
                        <strong>Your answer:</strong>{' '}
                        {Array.isArray(userAnswer)
                          ? userAnswer
                              .map((ans, idx) =>
                                ans ? question.options?.[idx] : null
                              )
                              .filter(Boolean)
                              .join(', ')
                          : question.type === 'BOOLEAN'
                            ? userAnswer === true || userAnswer === 'true'
                              ? 'True'
                              : 'False'
                            : String(userAnswer)}
                      </p>
                      <p className="text-gray-600">
                        <strong>Correct answer:</strong>{' '}
                        {question.type === 'BOOLEAN'
                          ? question.correctAnswers?.[0] === true ||
                            question.correctAnswers?.[0] === 'true'
                            ? 'True'
                            : 'False'
                          : question.correctAnswers?.join(', ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }, [quiz, quizScore, userAnswers, resetQuiz]);

  const BooleanQuestionEdit = ({
    index,
    register,
    errors,
  }: {
    index: number;
    register: UseFormRegister<QuizFormData>;
    errors: FieldErrors<QuizFormData>;
  }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <input
          {...register(`questions.${index}.text`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Enter your question..."
        />
        {errors.questions?.[index]?.text && (
          <p className="text-red-500 text-sm mt-1">
            {errors.questions[index].text.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer
        </label>
        <div className="space-y-2">
          <label className="flex items-center text-black">
            <input
              type="radio"
              {...register(`questions.${index}.correctAnswers.0`)}
              value="true"
              className="mr-2"
            />
            True
          </label>
          <label className="flex items-center text-black">
            <input
              type="radio"
              {...register(`questions.${index}.correctAnswers.0`)}
              value="false"
              className="mr-2"
            />
            False
          </label>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register(`questions.${index}.required`)}
          className="mr-2"
        />
        <label className="text-sm text-gray-700">Required question</label>
      </div>
    </div>
  );

  const InputQuestionEdit = ({
    index,
    register,
    errors,
  }: {
    index: number;
    register: UseFormRegister<QuizFormData>;
    errors: FieldErrors<QuizFormData>;
  }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text
        </label>
        <input
          {...register(`questions.${index}.text`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Enter your question..."
        />
        {errors.questions?.[index]?.text && (
          <p className="text-red-500 text-sm mt-1">
            {errors.questions[index].text.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer
        </label>
        <input
          {...register(`questions.${index}.correctAnswers.0`)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          placeholder="Enter the correct answer..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register(`questions.${index}.required`)}
          className="mr-2 text-black"
        />
        <label className="text-sm text-gray-700">Required question</label>
      </div>
    </div>
  );

  const QuizEditingInterface = useCallback(() => {
    if (!quiz) return null;

    return (
      <div className="min-h-screen bg-amber-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-2xl border-2 border-amber-200">
            <div className="px-8 py-6 border-b border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-amber-900">
                    Edit Quiz
                  </h1>
                </div>
                <button
                  onClick={cancelEditing}
                  className="text-amber-600 hover:text-amber-800 flex items-center font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(saveQuiz)} className="p-8">
              {/* Quiz Title */}
              <div className="mb-10">
                <label className="block text-lg font-semibold text-amber-900 mb-3">
                  Quiz Title
                </label>
                <input
                  {...register('title')}
                  className="w-full px-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg text-black"
                  placeholder="Enter quiz title..."
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Questions */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-amber-900">
                    Questions ({fields.length})
                  </h2>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowQuestionTypes(!showQuestionTypes)}
                      className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center space-x-2 transition-colors shadow-lg font-semibold cursor-pointer"
                    >
                      <Plus size={20} />
                      <span>Add Question</span>
                      {showQuestionTypes ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>

                    {/* Question Type Dropdown */}
                    {showQuestionTypes && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <div className="py-1">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                            Choose Question Type
                          </div>
                          <button
                            type="button"
                            onClick={() => addQuestion('BOOLEAN')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center space-x-3 transition-colors cursor-pointer"
                          >
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">
                                True/False Question
                              </div>
                              <div className="text-xs text-gray-500">
                                Yes or No answer
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => addQuestion('INPUT')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center space-x-3 transition-colors cursor-pointer"
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">
                                Text Input Question
                              </div>
                              <div className="text-xs text-gray-500">
                                Short text answer
                              </div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => addQuestion('CHECKBOX')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-3 transition-colors cursor-pointer"
                          >
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <div>
                              <div className="font-medium">
                                Multiple Choice Question
                              </div>
                              <div className="text-xs text-gray-500">
                                Multiple correct answers
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border-2 border-amber-200 rounded-xl p-6 bg-amber-50"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-amber-900">
                        Question {index + 1}
                      </h3>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="text-red-500 hover:text-red-700 flex items-center px-3 py-2 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={18} className="mr-1" />
                        </button>
                      )}
                    </div>

                    <input
                      type="hidden"
                      {...register(`questions.${index}.id`)}
                    />
                    <input
                      type="hidden"
                      {...register(`questions.${index}.type`)}
                    />

                    {watch(`questions.${index}.type`) === 'BOOLEAN' && (
                      <BooleanQuestionEdit
                        index={index}
                        register={register}
                        errors={errors}
                      />
                    )}

                    {watch(`questions.${index}.type`) === 'INPUT' && (
                      <InputQuestionEdit
                        index={index}
                        register={register}
                        errors={errors}
                      />
                    )}

                    {watch(`questions.${index}.type`) === 'CHECKBOX' && (
                      <CheckboxQuestionEdit
                        index={index}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        questionType={watch(`questions.${index}.type`) || ''}
                      />
                    )}
                  </div>
                ))}

                {errors.questions && (
                  <p className="text-red-500 text-sm">
                    {errors.questions.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-10 flex justify-center space-x-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg cursor-pointer"
                >
                  <Save size={20} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }, [
    quiz,
    fields,
    register,
    errors,
    watch,
    setValue,
    handleSubmit,
    saveQuiz,
    isSaving,
    showQuestionTypes,
    setShowQuestionTypes,
    addQuestion,
    removeQuestion,
    cancelEditing,
    dropdownRef,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quiz Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The quiz you&apos;re looking for doesn&apos;t exist or has been
              deleted.
            </p>
            <Link
              href="/quizzes"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'taking') {
    return (
      <QuizTakingInterface
        quiz={quiz}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        handleAnswerChange={handleAnswerChange}
        nextQuestion={nextQuestion}
        previousQuestion={previousQuestion}
        submitQuiz={submitQuiz}
        resetQuiz={resetQuiz}
      />
    );
  }

  if (quizState === 'completed') {
    return <QuizResultsInterface />;
  }

  if (quizState === 'editing') {
    return <QuizEditingInterface />;
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <Link
              href="/quizzes"
              className="inline-flex items-center text-amber-700 hover:text-amber-900 mr-4 font-medium text-sm sm:text-base"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Quizzes
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-900 mb-4">
                  {quiz.title}
                </h1>
                <div className="flex items-center text-amber-700 mb-6 text-base sm:text-lg">
                  <FileText size={20} className="mr-3" />
                  <span className="mr-6">
                    {quiz.questions?.length || 0} questions
                  </span>
                  <Calendar size={20} className="mr-3" />
                  <span>Created {formatDate(quiz.createdAt!)}</span>
                </div>
                <p className="text-amber-800 text-base sm:text-lg">
                  Preview Mode
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={startQuiz}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-semibold shadow-lg cursor-pointer text-sm sm:text-base"
                >
                  <Play size={20} className="mr-2" />
                  Start Quiz
                </button>
                <button
                  onClick={startEditing}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-amber-200 text-amber-900 rounded-xl hover:bg-amber-300 transition-colors font-semibold shadow-lg cursor-pointer text-sm sm:text-base"
                >
                  <Edit size={20} className="mr-2" />
                  Edit Quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            Questions ({quiz.questions?.length || 0})
          </h2>

          {quiz.questions?.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-xl border-2 border-amber-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <span className="text-lg font-semibold text-amber-700 mr-3">
                      Question {index + 1}
                    </span>
                    {question.required && (
                      <span className="ml-3 px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-amber-900 text-lg mb-4">{question.text}</p>
                </div>
              </div>

              {/* Question-specific content */}
              {question.type === 'BOOLEAN' && (
                <div className="space-y-3">
                  <div className="text-lg font-semibold text-amber-700 mb-3">
                    Answer Options:
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <input type="radio" disabled className="mr-3" />
                      <span className="text-amber-900 text-lg">True</span>
                    </div>
                    <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <input type="radio" disabled className="mr-3" />
                      <span className="text-amber-900 text-lg">False</span>
                    </div>
                  </div>
                </div>
              )}

              {question.type === 'INPUT' && (
                <div>
                  <div className="text-lg font-semibold text-amber-700 mb-3">
                    Your Answer:
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200">
                    <input
                      type="text"
                      placeholder="Enter your answer here..."
                      disabled
                      className="w-full bg-transparent text-amber-600 placeholder-amber-400 text-lg"
                    />
                  </div>
                </div>
              )}

              {question.type === 'CHECKBOX' && question.options && (
                <div>
                  <div className="text-lg font-semibold text-amber-700 mb-3">
                    Answer Options:
                  </div>
                  <div className="space-y-2">
                    {question?.options &&
                      Array.isArray(question.options) &&
                      question.options.length > 0 &&
                      question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200"
                        >
                          <input type="checkbox" disabled className="mr-3" />
                          <span className="text-amber-900 text-lg">
                            {option}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
