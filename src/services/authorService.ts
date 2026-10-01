import { User } from '@/types';

export interface AuthorWithStats extends User {
  publishedStoriesCount: number;
  totalReads: number;
}

// Service layer for Authors - Ready for your custom backend integration
export const authorService = {
  async getAllAuthors(): Promise<AuthorWithStats[]> {
    // TODO: Connect your backend API or database query here
    return [];
  },

  async getAuthorById(id: string): Promise<User | null> {
    // TODO: Connect your backend API or database query here
    return null;
  },

  async updateAuthor(id: string, updates: Partial<User>): Promise<User> {
    // TODO: Connect your backend API or database query here
    throw new Error('Backend not yet connected');
  }
};
