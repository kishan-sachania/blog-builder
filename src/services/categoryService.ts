import { Category } from '@/types';

// Service layer for Categories - Ready for your custom backend integration
export const categoryService = {
  async getAllCategories(): Promise<(Category & { postCount: number })[]> {
    // TODO: Connect your backend API or database query here
    return [];
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    // TODO: Connect your backend API or database query here
    return null;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    // TODO: Connect your backend API or database query here
    throw new Error('Backend not yet connected');
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    // TODO: Connect your backend API or database query here
    throw new Error('Backend not yet connected');
  },

  async deleteCategory(id: string): Promise<boolean> {
    // TODO: Connect your backend API or database query here
    return true;
  }
};
