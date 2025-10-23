import Link from 'next/link';
import { Plus, List, FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-8 text-center">
        <h1 className="text-5xl font-bold text-amber-900 mb-4">Quiz Builder</h1>
        <p className="text-amber-700 text-xl mb-8">
          Create interactive quizzes with multiple question types
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/create"
            className="inline-flex items-center justify-center px-8 py-4 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors shadow-lg font-semibold text-lg"
          >
            <Plus size={24} className="mr-2" />
            Create New Quiz
          </Link>

          <Link
            href="/quizzes"
            className="inline-flex items-center justify-center px-8 py-4 bg-amber-200 text-amber-900 rounded-xl hover:bg-amber-300 transition-colors shadow-lg font-semibold text-lg"
          >
            <List size={24} className="mr-2" />
            View All Quizzes
          </Link>
        </div>

        <div className="mt-8 text-amber-600">
          <FileText size={20} className="inline mr-2" />
          Build, manage, and share your quiz collection
        </div>
      </div>
    </div>
  );
}
