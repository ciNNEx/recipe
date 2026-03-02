import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRecipeById, deleteRecipe } from '../../database/queries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SmartTimerText } from '@/components/SmartTimerText';
import { useGroceryStore } from '../../store/useGroceryStore';

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<any>(null);
    const [originalYield, setOriginalYield] = useState<number>(1);
    const [portions, setPortions] = useState<number>(1);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [instructions, setInstructions] = useState<string[]>([]);
    const addItems = useGroceryStore((state) => state.addItems);

    const handleAddGroceries = () => {
        const scaledIngredients = ingredients.map(ing => scaleIngredient(ing));
        addItems(scaledIngredients);
        Alert.alert('Added', 'Ingredients successfully added to your grocery list!');
    };

    useEffect(() => {
        async function loadRecipe() {
            if (!id) return;
            try {
                const data = await getRecipeById(Number(id));
                if (data) {
                    setRecipe(data);
                    try {
                        const parsedIngredients = JSON.parse(data.ingredientsJson || '[]');
                        setIngredients(parsedIngredients);
                        setInstructions(JSON.parse(data.instructionsJson || '[]'));
                    } catch (e) {
                        console.error('JSON parse error', e);
                    }

                    const scrapedYield = parseInt(data.recipeYield || '1', 10);
                    const baseYield = isNaN(scrapedYield) || scrapedYield <= 0 ? 1 : scrapedYield;
                    setOriginalYield(baseYield);
                    setPortions(baseYield);
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadRecipe();
    }, [id]);

    const scaleIngredient = (ingredient: string) => {
        if (portions === originalYield) return ingredient;
        const ratio = portions / originalYield;

        // Regex to match numbers including decimals and basic fractions (e.g. 1, 1.5, 1/2)
        return ingredient.replace(/(\d+\/?\d*|\d*\.\d+)/g, (match) => {
            let val = 0;
            if (match.includes('/')) {
                const [num, den] = match.split('/');
                val = parseInt(num) / parseInt(den);
            } else {
                val = parseFloat(match);
            }

            if (isNaN(val)) return match;

            const newVal = val * ratio;
            // Round to 2 decimals avoiding long floats
            return (Math.round(newVal * 100) / 100).toString();
        });
    };

    const handleDelete = async () => {
        if (recipe?.id) {
            await deleteRecipe(recipe.id);
            router.back();
        }
    };

    if (!recipe) {
        return (
            <View className="flex-1 bg-neutral-900 items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-neutral-900" bounces={false}>
            {/* Header Image */}
            <View className="w-full h-72 bg-neutral-800 relative">
                {recipe.image ? (
                    <Image source={{ uri: recipe.image }} className="w-full h-full absolute" resizeMode="cover" />
                ) : (
                    <View className="w-full h-full items-center justify-center">
                        <IconSymbol name="photo.fill" size={60} color="#4b5563" />
                    </View>
                )}
                <View className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-900 to-transparent" />

                {/* Back Button */}
                <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0 px-4 flex-row justify-between">
                    <TouchableOpacity
                        className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
                        onPress={() => router.back()}
                    >
                        <IconSymbol name="chevron.left" size={20} color="#fff" />
                    </TouchableOpacity>
                    <View className="flex-row">
                        <TouchableOpacity
                            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center mr-3 backdrop-blur-md"
                            onPress={() => router.push({ pathname: '/recipe/edit/[id]', params: { id: recipe.id } })}
                        >
                            <IconSymbol name="pencil" size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-10 h-10 bg-red-500/80 rounded-full items-center justify-center"
                            onPress={handleDelete}
                        >
                            <IconSymbol name="trash.fill" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>

            <View className="px-6 py-6 -mt-8 bg-neutral-900 rounded-t-3xl border-t border-neutral-800 shadow-xl">
                {/* Title */}
                <Text className="text-3xl font-black text-white mb-3" style={{ lineHeight: 36 }}>{recipe.name}</Text>

                {recipe.description && (
                    <Text className="text-gray-400 text-base mb-6 leading-relaxed">
                        {recipe.description}
                    </Text>
                )}

                {/* Action Row: Time and Portions */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Time</Text>
                        <Text className="text-white font-semibold">
                            {recipe.totalTime || recipe.cookTime || recipe.prepTime || 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Start Cooking Button */}
                <TouchableOpacity
                    className="bg-indigo-600 rounded-2xl py-5 mb-8 items-center justify-center flex-row shadow-lg shadow-indigo-500/30 border border-indigo-500/50"
                    onPress={() => router.push({ pathname: '/recipe/cooking', params: { id: recipe.id } })}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="play.fill" size={20} color="#fff" />
                    <Text className="text-white font-black text-xl ml-3 tracking-wide">START COOKING</Text>
                </TouchableOpacity>

                {/* Ingredients */}
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-white">Ingredients</Text>
                    <TouchableOpacity onPress={handleAddGroceries} className="bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/30">
                        <Text className="text-indigo-400 font-bold text-sm">+ Add to List</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-neutral-800 rounded-3xl p-5 mb-8 border border-neutral-700/50">
                    {ingredients.map((ing, idx) => (
                        <View key={idx} className="flex-row items-start mb-4 last:mb-0">
                            <View className="w-2 h-2 rounded-full bg-indigo-500 mt-2 mr-3" />
                            <Text className="text-gray-200 text-lg flex-1 leading-normal">
                                {scaleIngredient(ing)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Instructions */}
                <Text className="text-2xl font-bold text-white mb-4">Instructions</Text>
                <View className="mb-10 w-full">
                    {instructions.map((step, idx) => (
                        <View key={idx} className="mb-6 flex-row">
                            <View className="w-8 h-8 rounded-full bg-indigo-500/20 items-center justify-center mr-4 mt-0.5 border border-indigo-500/30">
                                <Text className="text-indigo-400 font-bold">{idx + 1}</Text>
                            </View>
                            <SmartTimerText
                                text={step}
                                baseStyle="text-gray-200 text-lg flex-1 leading-relaxed"
                            />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
