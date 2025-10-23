'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, FileText } from 'lucide-react';
import { QuizListItem } from '@/types/quiz';
import { quizAPI } from '@/lib/api';
import ConfirmationModal from '@/components/ConfirmationModal';
import Toast, { ToastType } from '@/components/Toast';

// Mock data for quizzes
/*
const mockQuizzes: Quiz[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    questions: [
      {
        id: 'q1',
        type: 'boolean',
        text: 'JavaScript is a statically typed language.',
        correctAnswers: [false],
        required: true,
      },
      {
        id: 'q2',
        type: 'input',
        text: 'What keyword is used to declare a variable in JavaScript?',
        correctAnswers: ['var', 'let', 'const'],
        required: true,
      },
      {
        id: 'q3',
        type: 'checkbox',
        text: 'Which of the following are JavaScript data types?',
        options: ['String', 'Number', 'Boolean', 'Array', 'Object'],
        correctAnswers: [true, true, true, true, true],
        required: true,
      },
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'React Hooks Quiz',
    questions: [
      {
        id: 'q1',
        type: 'boolean',
        text: 'useState can only be used in functional components.',
        correctAnswers: [true],
        required: true,
      },
      {
        id: 'q2',
        type: 'input',
        text: 'What hook is used for side effects in React?',
        correctAnswers: ['useEffect'],
        required: true,
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    title: 'CSS Flexbox Mastery',
    questions: [
      {
        id: 'q1',
        type: 'boolean',
        text: 'Flexbox is a one-dimensional layout method.',
        correctAnswers: [true],
        required: true,
      },
      {
        id: 'q2',
        type: 'checkbox',
        text: 'Which properties control flex item alignment?',
        options: [
          'justify-content',
          'align-items',
          'flex-direction',
          'flex-wrap',
        ],
        correctAnswers: [true, true, false, false],
        required: true,
      },
      {
        id: 'q3',
        type: 'input',
        text: 'What is the default value of flex-direction?',
        correctAnswers: ['row'],
        required: true,
      },
      {
        id: 'q4',
        type: 'boolean',
        text: 'flex: 1 is equivalent to flex: 1 1 0%.',
        correctAnswers: [true],
        required: true,
      },
    ],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '4',
    title: 'TypeScript Basics',
    questions: [
      {
        id: 'q1',
        type: 'input',
        text: 'What file extension is used for TypeScript files?',
        correctAnswers: ['.ts', '.tsx'],
        required: true,
      },
      {
        id: 'q2',
        type: 'boolean',
        text: 'TypeScript is a superset of JavaScript.',
        correctAnswers: [true],
        required: true,
      },
    ],
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30'),
  },
];
*/

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<QuizListItem | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const data = await quizAPI.getQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setToast({
          message: 'Error loading quizzes. Please try again.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const confirmDelete = (quiz: QuizListItem) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      await quizAPI.deleteQuiz(quizToDelete.id);
      setQuizzes(prevQuizzes =>
        prevQuizzes.filter(quiz => quiz.id !== quizToDelete.id)
      );
      setToast({ message: 'Quiz deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setToast({
        message: 'Error deleting quiz. Please try again.',
        type: 'error',
      });
    } finally {
      setShowDeleteModal(false);
      setQuizToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-900">
                Quizzes
              </h1>
            </div>
            <Link
              href="/create"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg font-semibold text-sm sm:text-base"
            >
              <Plus size={20} className="mr-2" />
              Create New Quiz
            </Link>
          </div>
        </div>

        {/* Quizzes Grid */}
        {!quizzes || quizzes.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={80} className="mx-auto text-amber-300 mb-6" />
            <h3 className="text-2xl font-bold text-amber-900 mb-4">
              No quizzes yet
            </h3>
            <p className="text-amber-700 text-lg mb-8">
              Get started by creating your first quiz
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {quizzes.map(quiz => (
              <div
                key={quiz.id}
                className="bg-white rounded-xl border-2 border-amber-200 p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => (window.location.href = `/quiz/${quiz.id}`)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {quiz.title}
                      </h3>
                      <div className="flex items-center text-amber-700 text-sm sm:text-base">
                        <FileText size={16} className="mr-2" />
                        <span>{quiz._count?.questions || 0} questions</span>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        confirmDelete(quiz);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setQuizToDelete(null);
        }}
        onConfirm={handleDeleteQuiz}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quizToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
