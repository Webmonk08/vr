import { create } from 'zustand';
import { ProductService } from '@/services/products.service';

interface CategoryState {
  categories: string[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  fetchCategories: async () => {
    // Don't fetch if we already have categories
    if (get().categories.length > 0) return;

    set({ isLoading: true, error: null });
    try {
      const products = await ProductService.getAll();
      const allCategories = products.flatMap(p => 
        p.variants.map(v => v.category)
      ).filter(Boolean);
      
      // Get unique categories and take top 3 as requested (or just unique set)
      const uniqueCategories = Array.from(new Set(allCategories));
      set({ categories: uniqueCategories, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch categories', isLoading: false });
    }
  },
}));
