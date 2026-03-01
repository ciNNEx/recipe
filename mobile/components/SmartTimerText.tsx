import React from 'react';
import { Text, Alert } from 'react-native';

export function SmartTimerText({ text, baseStyle }: { text: string; baseStyle?: string }) {
    // Regex to find things like "30 minutes", "1.5 hours", "10-15 mins"
    const timeRegex = /(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?\s*(?:minutes?|mins?|hours?|hrs?))/gi;
    const parts = text.split(timeRegex);

    const handleTimerPress = (timeStr: string) => {
        Alert.alert(
            'Smart Timer Started',
            `A timer for ${timeStr} has been set. We will notify you when it's done!`,
            [{ text: 'OK', style: 'default' }]
        );
    };

    return (
        <Text className={baseStyle}>
            {parts.map((part, i) => {
                if (part.match(timeRegex)) {
                    return (
                        <Text
                            key={i}
                            className="text-indigo-400 font-bold bg-indigo-500/20"
                            onPress={() => handleTimerPress(part)}
                        >
                            {' '}{part}{' '}
                        </Text>
                    );
                }
                return <Text key={i}>{part}</Text>;
            })}
        </Text>
    );
}
