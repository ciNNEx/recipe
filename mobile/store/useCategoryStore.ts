import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CategoryState {
    categories: string[];
    addCategory: (name: string) => void;
    removeCategory: (name: string) => void;
}

export const useCategoryStore = create<CategoryState>()(
    persist(
        (set) => ({
            categories: ['Bread', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Vegan'],
            addCategory: (name) =>
                set((state) => {
                    const trimmed = name.trim();
                    if (!trimmed || state.categories.includes(trimmed) || trimmed.toLowerCase() === 'all') {
                        return state;
                    }
                    return { categories: [...state.categories, trimmed] };
                }),
            removeCategory: (name) =>
                set((state) => ({
                    categories: state.categories.filter((cat) => cat !== name),
                })),
        }),
        {
            name: 'category-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
