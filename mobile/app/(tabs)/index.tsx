import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, RefreshControl, TextInput, ScrollView, Modal, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getAllRecipes, updateRecipe } from '../../database/queries';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RecipeLibraryScreen() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { categories, addCategory, removeCategory } = useCategoryStore();

  const [isNewCategoryModalVisible, setIsNewCategoryModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [recipeToAssign, setRecipeToAssign] = useState<any>(null);

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

  const formatToShortTime = (timeStr: string | null | undefined) => {
    if (!timeStr || timeStr === 'Time N/A') return 'N/A';

    let h = 0;
    let m = 0;
    const hrMatch = timeStr.match(/(\d+)\s*hr/);
    const minMatch = timeStr.match(/(\d+)\s*min/);

    if (hrMatch) h = parseInt(hrMatch[1], 10);
    if (minMatch) m = parseInt(minMatch[1], 10);

    if (h === 0 && m === 0) return timeStr;

    if (m >= 60) {
      h += Math.floor(m / 60);
      m = m % 60;
    }

    return `${timeStr.startsWith('~') ? '~' : ''}${h}:${m.toString().padStart(2, '0')}h`;
  };

  const renderRecipeItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-neutral-800 rounded-3xl mb-6 overflow-hidden shadow-xl border border-neutral-700/50"
      activeOpacity={0.8}
      onPress={() => router.push(`/recipe/${item.id}`)}
      onLongPress={() => {
        setRecipeToAssign(item);
        setAssignModalVisible(true);
      }}
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
              {formatToShortTime(item.totalTime || item.cookTime || item.prepTime || 'Time N/A')}
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
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center mb-4">
          {isSearchActive ? (
            <TextInput
              className="flex-1 bg-neutral-800 text-white rounded-full px-4 py-3 mr-3 text-base"
              placeholder="Search recipes..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          ) : (
            <Text className="text-3xl font-black text-white tracking-tight">Your Recipes</Text>
          )}
          <TouchableOpacity
            className="p-3 bg-neutral-800 rounded-full"
            onPress={() => {
              setIsSearchActive(!isSearchActive);
              if (isSearchActive) setSearchQuery('');
            }}
          >
            <IconSymbol name={isSearchActive ? "xmark" : "magnifyingglass"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 flex-row">
          <TouchableOpacity
            key="All"
            onPress={() => setSelectedCategory('All')}
            className={`mr-3 px-5 py-2.5 rounded-full ${selectedCategory === 'All' ? 'bg-indigo-600' : 'bg-neutral-800'}`}
          >
            <Text className={`font-bold ${selectedCategory === 'All' ? 'text-white' : 'text-gray-400'}`}>All</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              onLongPress={() => {
                Alert.alert("Delete Category", `Remove '${category}'?`, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete", style: "destructive", onPress: () => {
                      removeCategory(category);
                      if (selectedCategory === category) setSelectedCategory('All');
                    }
                  }
                ]);
              }}
              className={`mr-3 px-5 py-2.5 rounded-full ${selectedCategory === category ? 'bg-indigo-600' : 'bg-neutral-800'}`}
            >
              <Text className={`font-bold ${selectedCategory === category ? 'text-white' : 'text-gray-400'}`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => setIsNewCategoryModalVisible(true)}
            className="mr-6 px-4 py-2.5 rounded-full border border-neutral-700 border-dashed items-center justify-center bg-neutral-800/50"
          >
            <Text className="text-neutral-400 font-bold text-sm">+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={recipes.filter(recipe => {
          const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()));

          if (selectedCategory === 'All') return matchesSearch;

          const cat = selectedCategory.toLowerCase();
          const matchesCategory = recipe.name.toLowerCase().includes(cat) ||
            (recipe.description && recipe.description.toLowerCase().includes(cat)) ||
            (recipe.ingredientsJson && recipe.ingredientsJson.toLowerCase().includes(cat)) ||
            (recipe.category && recipe.category.toLowerCase() === cat);

          return matchesSearch && matchesCategory;
        })}
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
      <Modal visible={assignModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-neutral-800 w-full rounded-3xl p-6 shadow-2xl border border-neutral-700">
            <Text className="text-white text-xl font-bold mb-1 text-center">Move to Category</Text>
            <Text className="text-gray-400 text-sm text-center mb-6 line-clamp-1">{recipeToAssign?.name}</Text>

            <View className="flex-row flex-wrap justify-center mb-6">
              <TouchableOpacity
                onPress={async () => {
                  if (recipeToAssign) {
                    await updateRecipe(recipeToAssign.id, { ...recipeToAssign, category: 'Uncategorized' });
                    setAssignModalVisible(false);
                    fetchRecipes();
                  }
                }}
                className={`m-1.5 px-4 py-2 bg-neutral-700 rounded-full ${recipeToAssign?.category === 'Uncategorized' ? 'border border-indigo-500' : ''}`}
              >
                <Text className="text-white font-medium">None</Text>
              </TouchableOpacity>
              {categories.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={async () => {
                    if (recipeToAssign) {
                      await updateRecipe(recipeToAssign.id, { ...recipeToAssign, category: c });
                      setAssignModalVisible(false);
                      fetchRecipes();
                    }
                  }}
                  className={`m-1.5 px-4 py-2 bg-neutral-700 rounded-full ${recipeToAssign?.category === c ? 'border border-indigo-500 bg-indigo-600/20' : ''}`}
                >
                  <Text className={`font-medium ${recipeToAssign?.category === c ? 'text-indigo-400' : 'text-white'}`}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setAssignModalVisible(false)} className="py-4 bg-neutral-700 rounded-xl items-center">
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isNewCategoryModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-neutral-800 w-full rounded-3xl p-6 shadow-2xl border border-neutral-700">
            <Text className="text-white text-xl font-bold mb-4 text-center">New Category</Text>
            <TextInput
              className="bg-neutral-700 text-white rounded-xl px-4 py-4 text-base mb-6"
              placeholder="e.g. Italian, Keto..."
              placeholderTextColor="#9ca3af"
              value={newCatName}
              onChangeText={setNewCatName}
              autoFocus
            />
            <View className="flex-row">
              <TouchableOpacity onPress={() => { setIsNewCategoryModalVisible(false); setNewCatName(''); }} className="flex-1 py-4 mr-2 bg-neutral-700 rounded-xl items-center">
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  addCategory(newCatName);
                  setIsNewCategoryModalVisible(false);
                  setNewCatName('');
                }}
                className="flex-1 py-4 ml-2 bg-indigo-600 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
