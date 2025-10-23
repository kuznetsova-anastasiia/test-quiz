'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Question, QuestionType, QuizFormData } from '@/types/quiz';
import { quizAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';

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

const BooleanQuestion = ({
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
            className="mr-2 text-black"
          />
          True
        </label>
        <label className="flex items-center text-black">
          <input
            type="radio"
            {...register(`questions.${index}.correctAnswers.0`)}
            value="false"
            className="mr-2 text-black"
          />
          False
        </label>
      </div>
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

const InputQuestion = ({
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

interface CheckboxQuestionProps {
  index: number;
  register: UseFormRegister<QuizFormData>;
  errors: FieldErrors<QuizFormData>;
  setValue: UseFormSetValue<QuizFormData>;
}

const CheckboxQuestion = ({
  index,
  register,
  errors,
  setValue,
}: CheckboxQuestionProps) => {
  const [localOptions, setLocalOptions] = useState<string[]>(['']);

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
          key={`question-text-${index}`}
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
              key={`q${index}-opt${optionIndex}`}
              className="flex items-center space-x-2"
            >
              <input
                key={`option-${index}-${optionIndex}`}
                type="text"
                value={option}
                onChange={e => updateOption(optionIndex, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder={`Option ${optionIndex + 1}`}
              />
              <input
                key={`checkbox-${index}-${optionIndex}`}
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
          key={`required-${index}`}
          type="checkbox"
          {...register(`questions.${index}.required`)}
          className="mr-2"
        />
        <label className="text-sm text-gray-700">Required question</label>
      </div>
    </div>
  );
};

export default function QuizCreationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      questions: [
        {
          id: crypto.randomUUID(),
          type: 'BOOLEAN',
          text: '',
          required: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

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
    setShowQuestionTypes(false); // Close the dropdown after adding a question
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

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    try {
      const quizData = {
        title: data.title,
        questions: data.questions.map((question: Question) => ({
          type: question.type.toUpperCase() as 'BOOLEAN' | 'INPUT' | 'CHECKBOX',
          text: question.text,
          options: question.options || undefined,
          correctAnswers: question.correctAnswers || undefined,
          required: question.required,
        })),
      };

      const createdQuiz = await quizAPI.createQuiz(quizData);
      console.log('Quiz created successfully:', createdQuiz);

      router.push('/quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-2xl border-2 border-amber-200">
          <div className="px-8 py-6 border-b border-amber-100">
            <div className="flex items-center mb-6">
              <Link
                href="/quizzes"
                className="inline-flex items-center text-amber-700 hover:text-amber-900 mr-4 font-medium"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Quizzes
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-amber-900 mb-2">
              Create Quiz
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8">
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
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-amber-900">
                  Questions ({fields.length})
                </h2>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowQuestionTypes(!showQuestionTypes)}
                    className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center space-x-2 transition-colors shadow-lg cursor-pointer"
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
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10 animate-in slide-in-from-top-2 duration-200">
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

                  <input type="hidden" {...register(`questions.${index}.id`)} />
                  <input
                    type="hidden"
                    {...register(`questions.${index}.type`)}
                  />

                  {watch(`questions.${index}.type`) === 'BOOLEAN' && (
                    <BooleanQuestion
                      index={index}
                      register={register}
                      errors={errors}
                    />
                  )}

                  {watch(`questions.${index}.type`) === 'INPUT' && (
                    <InputQuestion
                      index={index}
                      register={register}
                      errors={errors}
                    />
                  )}

                  {watch(`questions.${index}.type`) === 'CHECKBOX' && (
                    <CheckboxQuestion
                      index={index}
                      register={register}
                      errors={errors}
                      setValue={setValue}
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
            <div className="mt-10 flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-semibold shadow-lg cursor-pointer"
              >
                <Save size={20} className="mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
