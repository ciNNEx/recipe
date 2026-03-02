import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRecipeById } from '../../database/queries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useKeepAwake } from 'expo-keep-awake';
import { SmartTimerText } from '@/components/SmartTimerText';

export default function CookingModeScreen() {
    useKeepAwake();

    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [recipe, setRecipe] = useState<any>(null);
    const [instructions, setInstructions] = useState<string[]>([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        async function loadRecipe() {
            if (!id) return;
            try {
                const data = await getRecipeById(Number(id));
                if (data) {
                    setRecipe(data);
                    try {
                        setInstructions(JSON.parse(data.instructionsJson || '[]'));
                    } catch (e) {
                        console.error('JSON parse error', e);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
        loadRecipe();
    }, [id]);

    if (!recipe) {
        return (
            <View className="flex-1 bg-neutral-900 items-center justify-center">
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    const step = instructions[currentStep];

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-neutral-800">
                <TouchableOpacity
                    className="w-12 h-12 bg-neutral-800 rounded-full items-center justify-center"
                    onPress={() => router.back()}
                >
                    <IconSymbol name="xmark" size={24} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Cooking Mode</Text>
                <View className="w-12 h-12" />
            </View>

            <ScrollView className="flex-1 px-8 pt-10" contentContainerClassName="flex-grow justify-center">
                <Text className="text-indigo-400 font-black text-2xl mb-6 tracking-widest uppercase">
                    Step {currentStep + 1} of {instructions.length}
                </Text>

                <SmartTimerText
                    text={step}
                    baseStyle="text-white text-4xl font-bold leading-tight"
                />
            </ScrollView>

            {/* Navigation Footer */}
            <View className="flex-row items-center justify-between px-8 py-8 bg-neutral-900 border-t border-neutral-800">
                <TouchableOpacity
                    className={`w-16 h-16 rounded-full items-center justify-center ${currentStep === 0 ? 'bg-neutral-800 opacity-50' : 'bg-neutral-700'}`}
                    disabled={currentStep === 0}
                    onPress={() => setCurrentStep(c => Math.max(0, c - 1))}
                >
                    <IconSymbol name="chevron.left" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    className={`px-12 py-5 rounded-full items-center justify-center ${currentStep === instructions.length - 1 ? 'bg-green-600' : 'bg-indigo-600'}`}
                    onPress={() => {
                        if (currentStep === instructions.length - 1) {
                            router.back();
                        } else {
                            setCurrentStep(c => Math.min(instructions.length - 1, c + 1));
                        }
                    }}
                >
                    <Text className="text-white font-black text-xl">
                        {currentStep === instructions.length - 1 ? 'FINISH' : 'NEXT STEP'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
