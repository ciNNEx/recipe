import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const recipes = sqliteTable('recipes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    description: text('description'),
    image: text('image'),
    ingredientsJson: text('ingredients').notNull(), // Stored as a JSON string
    instructionsJson: text('instructions').notNull(), // Stored as a JSON string
    prepTime: text('prep_time'),
    cookTime: text('cook_time'),
    totalTime: text('total_time'),
    recipeYield: text('recipe_yield'),
    url: text('url'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
