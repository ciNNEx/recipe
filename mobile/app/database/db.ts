import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Open synchronous SQLite database connection
export const expoDb = openDatabaseSync('recipes.db');
export const db = drizzle(expoDb, { schema });
