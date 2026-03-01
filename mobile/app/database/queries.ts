import { db } from './db';
import { recipes } from './schema';
import { eq } from 'drizzle-orm';

export interface RecipeData {
    name?: string;
    image?: string;
    description?: string;
    recipeIngredient?: string[];
    recipeInstructions?: any[];
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    recipeYield?: string;
    url?: string;
}

export async function getAllRecipes() {
    return await db.select().from(recipes).orderBy(recipes.createdAt);
}

export async function getRecipeById(id: number) {
    const result = await db.select().from(recipes).where(eq(recipes.id, id));
    return result[0];
}

export async function insertRecipe(recipe: RecipeData) {
    return await db.insert(recipes).values({
        name: recipe.name || 'Unknown Recipe',
        description: recipe.description || '',
        image: recipe.image || '',
        ingredientsJson: JSON.stringify(recipe.recipeIngredient || []),
        instructionsJson: JSON.stringify(recipe.recipeInstructions || []),
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        totalTime: recipe.totalTime || '',
        recipeYield: recipe.recipeYield || '',
        url: recipe.url || '',
    }).returning();
}

export async function deleteRecipe(id: number) {
    return await db.delete(recipes).where(eq(recipes.id, id));
}

export async function updateRecipe(id: number, recipe: RecipeData) {
    return await db.update(recipes).set({
        name: recipe.name || 'Unknown Recipe',
        description: recipe.description || '',
        image: recipe.image || '',
        ingredientsJson: JSON.stringify(recipe.recipeIngredient || []),
        instructionsJson: JSON.stringify(recipe.recipeInstructions || []),
        prepTime: recipe.prepTime || '',
        cookTime: recipe.cookTime || '',
        totalTime: recipe.totalTime || '',
        recipeYield: recipe.recipeYield || '',
    }).where(eq(recipes.id, id)).returning();
}
