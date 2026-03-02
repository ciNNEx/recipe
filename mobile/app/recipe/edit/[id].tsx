import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRecipeById, updateRecipe } from '../../../database/queries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function EditRecipeScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [ingredientsText, setIngredientsText] = useState('');
    const [instructionsText, setInstructionsText] = useState('');

    useEffect(() => {
        async function loadRecipe() {
            if (!id) return;
            try {
                const data = await getRecipeById(Number(id));
                if (data) {
                    setRecipe(data);
                    setName(data.name);
                    setDescription(data.description || '');

                    const ings = JSON.parse(data.ingredientsJson || '[]');
                    setIngredientsText(ings.join('\n\n'));

                    const insts = JSON.parse(data.instructionsJson || '[]');
                    setInstructionsText(insts.join('\n\n'));
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadRecipe();
    }, [id]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsLoading(true);

        // Parse the lists back from newline separated text
        const newIngredients = ingredientsText.split('\n\n').map(i => i.trim()).filter(i => i);
        const newInstructions = instructionsText.split('\n\n').map(i => i.trim()).filter(i => i);

        try {
            await updateRecipe(Number(id), {
                ...recipe,
                name,
                description,
                recipeIngredient: newIngredients,
                recipeInstructions: newInstructions
            });
            router.back();
        } catch (error) {
            console.error('Failed to update recipe:', error);
        } finally {
            setIsLoading(false);
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
        <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900 z-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Text className="text-gray-400 text-lg">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">Edit Recipe</Text>
                    <TouchableOpacity onPress={handleSave} disabled={isLoading} className="p-2 flex-row items-center">
                        {isLoading ? <ActivityIndicator color="#818cf8" className="mr-2" size="small" /> : null}
                        <Text className="text-indigo-400 font-bold text-lg">Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6 pt-6" contentContainerClassName="pb-12" keyboardDismissMode="on-drag">
                    <Text className="text-gray-400 text-sm font-bold uppercase mb-2 ml-1 tracking-wider">Title</Text>
                    <TextInput
                        className="bg-neutral-800 text-white text-lg rounded-2xl px-4 py-4 mb-6 border border-neutral-700/50"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#9ca3af"
                        placeholder="Recipe Name"
                    />

                    <Text className="text-gray-400 text-sm font-bold uppercase mb-2 ml-1 tracking-wider">Description</Text>
                    <TextInput
                        className="bg-neutral-800 text-white text-base rounded-2xl px-4 py-4 mb-6 border border-neutral-700/50 min-h-[100px]"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#9ca3af"
                        placeholder="A short description..."
                        multiline
                        textAlignVertical="top"
                    />

                    <Text className="text-gray-400 text-sm font-bold uppercase mb-2 ml-1 tracking-wider">Ingredients (Separate with empty line)</Text>
                    <TextInput
                        className="bg-neutral-800 text-white text-base rounded-2xl px-4 py-4 mb-6 border border-neutral-700/50 min-h-[200px]"
                        value={ingredientsText}
                        onChangeText={setIngredientsText}
                        placeholderTextColor="#9ca3af"
                        placeholder="1 cup of flour..."
                        multiline
                        textAlignVertical="top"
                    />

                    <Text className="text-gray-400 text-sm font-bold uppercase mb-2 ml-1 tracking-wider">Instructions (Separate with empty line)</Text>
                    <TextInput
                        className="bg-neutral-800 text-white text-base rounded-2xl px-4 py-4 mb-6 border border-neutral-700/50 min-h-[300px]"
                        value={instructionsText}
                        onChangeText={setInstructionsText}
                        placeholderTextColor="#9ca3af"
                        placeholder="Step 1..."
                        multiline
                        textAlignVertical="top"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
