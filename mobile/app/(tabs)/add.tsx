import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { insertRecipe } from '../database/queries';
import type { RecipeData } from '../database/queries';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddRecipeScreen() {
  const { sharedUrl } = useLocalSearchParams();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sharedUrl && typeof sharedUrl === 'string') {
      setUrl(sharedUrl);
    }
  }, [sharedUrl]);

  const handleDownload = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a valid URL.');
      return;
    }

    try {
      setIsLoading(true);
      // Make a request to our local backend parser
      // Note: Ideally, this URL points to wherever the backend is hosted. 
      // For local development on emulator, 10.0.2.2 points to host localhost.
      const backendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

      const response = await fetch(`${backendUrl}/api/parse-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error('Could not parse recipe from URL');
      }

      const data = await response.json();
      const recipe: RecipeData = data.recipe;

      if (!recipe) {
        throw new Error('Recipe data not found');
      }

      // Save to SQLite
      await insertRecipe(recipe);
      Alert.alert('Success!', 'Recipe has been saved safely offline.', [
        { text: 'OK', onPress: () => router.push('/(tabs)') }
      ]);
      setUrl('');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Failed to Download', error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerClassName="flex-grow justify-center px-6">
          <View className="mb-10">
            <Text className="text-4xl text-white font-bold mb-2">Save a Recipe!</Text>
            <Text className="text-gray-400 text-lg">Paste any web link below. We will extract the ingredients and ditch the ads.</Text>
          </View>

          <View className="bg-neutral-800 rounded-2xl p-4 shadow-lg mb-8">
            <Text className="text-gray-300 font-semibold mb-2">Recipe URL</Text>
            <TextInput
              className="bg-neutral-700 text-white rounded-xl px-4 py-4 text-base"
              placeholder="e.g. https://www.allrecipes.com/..."
              placeholderTextColor="#9ca3af"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <TouchableOpacity
            onPress={handleDownload}
            disabled={isLoading || !url}
            className={`rounded-2xl py-4 items-center justify-center flex-row ${isLoading || !url ? 'bg-indigo-500/50' : 'bg-indigo-600 active:bg-indigo-700'
              }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" className="mr-2" />
            ) : null}
            <Text className="text-white text-xl font-bold">
              {isLoading ? 'Extracting...' : 'Extract & Save'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
