import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGroceryStore } from '../../store/useGroceryStore';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function GroceryListScreen() {
    const { items, toggleItem, removeItem, clearAll } = useGroceryStore();

    const handleClear = () => {
        Alert.alert('Clear List', 'Are you sure you want to remove all items?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear All', style: 'destructive', onPress: clearAll }
        ]);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="flex-row items-center justify-between bg-neutral-800 p-4 rounded-2xl mb-3 shadow-sm border border-neutral-700/50">
            <TouchableOpacity
                className="flex-row items-center flex-1"
                onPress={() => toggleItem(item.id)}
            >
                <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${item.checked ? 'bg-indigo-500 border-indigo-500' : 'border-neutral-500'}`}>
                    {item.checked && <IconSymbol name="checkmark" size={14} color="#fff" />}
                </View>
                <Text className={`text-lg flex-1 ${item.checked ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                    {item.name}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeItem(item.id)} className="p-2 ml-2">
                <IconSymbol name="trash.fill" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
            <View className="px-6 pt-4 pb-6 flex-row justify-between items-center bg-neutral-900 z-10">
                <Text className="text-3xl font-black text-white tracking-tight">Grocery List</Text>
                {items.length > 0 && (
                    <TouchableOpacity
                        className="bg-red-500/20 px-4 py-2 rounded-full"
                        onPress={handleClear}
                    >
                        <Text className="text-red-400 font-bold">Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={items}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-32">
                        <View className="w-24 h-24 bg-neutral-800 rounded-full items-center justify-center mb-6">
                            <IconSymbol name="cart.fill" size={40} color="#4b5563" />
                        </View>
                        <Text className="text-white text-2xl font-bold mb-2 text-center">Your cart is empty</Text>
                        <Text className="text-gray-400 text-center max-w-[250px] leading-relaxed">
                            Add ingredients from any of your saved recipes to easily track what to buy.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
