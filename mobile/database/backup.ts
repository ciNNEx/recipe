// @ts-nocheck
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

const DB_FILENAME = 'recipes.db';
const DB_LOCAL_PATH = `${FileSystem.documentDirectory}SQLite/${DB_FILENAME}`;

export async function exportDatabase() {
    try {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
            Alert.alert('Sharing is not available on this device');
            return;
        }

        // Copy to cache directory first to make it safely sharable
        const cachePath = `${FileSystem.cacheDirectory}${DB_FILENAME}`;
        await FileSystem.copyAsync({
            from: DB_LOCAL_PATH,
            to: cachePath,
        });

        await Sharing.shareAsync(cachePath, {
            mimeType: 'application/x-sqlite3',
            dialogTitle: 'Export Recipe Database',
        });
    } catch (err) {
        console.error('Failed to export:', err);
        Alert.alert('Export Failed');
    }
}

export async function importDatabase() {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/x-sqlite3', '*/*'], // Fallback for various devices
            copyToCacheDirectory: true,
        });

        if (result.canceled || result.assets.length === 0) {
            return false; // User cancelled
        }

        const asset = result.assets[0];

        // Confirm overwrite
        return new Promise((resolve) => {
            Alert.alert(
                'Import Database',
                'This will OVERWRITE your current recipes. Are you sure?',
                [
                    { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
                    {
                        text: 'Overwrite',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await FileSystem.copyAsync({
                                    from: asset.uri,
                                    to: DB_LOCAL_PATH,
                                });
                                Alert.alert('Success', 'Database imported successfully! Please restart the app.');
                                resolve(true);
                            } catch (copyErr) {
                                console.error(copyErr);
                                resolve(false);
                            }
                        }
                    }
                ]
            );
        });

    } catch (err) {
        console.error('Failed to import:', err);
        Alert.alert('Import Failed');
        return false;
    }
}
