import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getAllRecipes } from '../database/queries';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RecipeLibraryScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchRecipes = async () => {
    try {
      const data = await getAllRecipes();
      setRecipes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  const renderRecipeItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-neutral-800 rounded-3xl mb-6 overflow-hidden shadow-xl border border-neutral-700/50"
      activeOpacity={0.8}
      onPress={() => router.push(`/recipe/${item.id}`)}
    >
      <View className="h-48 w-full bg-neutral-700">
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-neutral-800">
            <IconSymbol name="fork.knife" size={40} color="#6b7280" />
          </View>
        )}
      </View>
      <View className="p-5">
        <Text className="text-white text-xl font-bold mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="text-gray-400 text-sm mb-3 line-clamp-2" numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center">
            <IconSymbol name="clock.fill" size={14} color="#9ca3af" />
            <Text className="text-gray-400 text-xs ml-1 font-medium">
              {item.totalTime || item.cookTime || item.prepTime || 'Time N/A'}
            </Text>
          </View>
          <View className="bg-indigo-500/20 px-3 py-1 pb-1.5 rounded-full">
            <Text className="text-indigo-400 font-bold text-xs uppercase tracking-wider">
              {JSON.parse(item.ingredientsJson || '[]').length} items
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <Text className="text-3xl font-black text-white tracking-tight">Your Recipes</Text>
        <TouchableOpacity className="p-2 bg-neutral-800 rounded-full">
          <IconSymbol name="magnifyingglass" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRecipeItem}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#fff']}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <View className="w-24 h-24 bg-neutral-800 rounded-full items-center justify-center mb-6">
              <IconSymbol name="tray.fill" size={40} color="#4b5563" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">It's a bit empty here</Text>
            <Text className="text-gray-400 text-center max-w-[250px] leading-relaxed">
              Add your first recipe by pasting a link from any cooking website in the Add tab.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
