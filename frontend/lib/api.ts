const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreateQuizRequest {
  title: string;
  questions: {
    type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
    text: string;
    options?: string[];
    correctAnswers?: (string | boolean)[];
    required?: boolean;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions?: {
    id: string;
    type: 'BOOLEAN' | 'INPUT' | 'CHECKBOX';
    text: string;
    options?: string[] | null;
    correctAnswers?: (string | boolean)[] | null;
    required: boolean;
  }[];
  _count?: {
    questions: number;
  };
}

export interface QuizListResponse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
  };
}

class QuizAPI {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async createQuiz(quizData: CreateQuizRequest): Promise<Quiz> {
    return this.request<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async getQuizzes(): Promise<QuizListResponse[]> {
    return this.request<QuizListResponse[]>('/quizzes');
  }

  async getQuiz(id: string): Promise<Quiz> {
    return this.request<Quiz>(`/quizzes/${id}`);
  }

  async updateQuiz(
    id: string,
    quizData: Partial<CreateQuizRequest>
  ): Promise<Quiz> {
    return this.request<Quiz>(`/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(id: string): Promise<void> {
    return this.request<void>(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  }
}

export const quizAPI = new QuizAPI();
