import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GroceryItem {
    id: string;
    name: string;
    checked: boolean;
}

interface GroceryState {
    items: GroceryItem[];
    addItems: (newItems: string[]) => void;
    toggleItem: (id: string) => void;
    removeItem: (id: string) => void;
    clearAll: () => void;
}

export const useGroceryStore = create<GroceryState>()(
    persist(
        (set) => ({
            items: [],
            addItems: (newItems) =>
                set((state) => {
                    const added = newItems.map((name) => ({
                        id: Math.random().toString(36).substring(7),
                        name,
                        checked: false,
                    }));
                    return { items: [...state.items, ...added] };
                }),
            toggleItem: (id) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, checked: !item.checked } : item
                    ),
                })),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            clearAll: () => set({ items: [] }),
        }),
        {
            name: 'grocery-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
