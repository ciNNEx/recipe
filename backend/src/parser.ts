import * as cheerio from 'cheerio';

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

export async function extractRecipeFromUrl(url: string): Promise<RecipeData | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Look for application/ld+json scripts
        let recipeData: any = null;

        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const text = $(el).html() || '';
                const parsed = JSON.parse(text);

                // JSON-LD can be an array of objects or a single object
                const findRecipe = (obj: any): any => {
                    if (!obj) return null;
                    if (Array.isArray(obj)) {
                        for (const item of obj) {
                            const res = findRecipe(item);
                            if (res) return res;
                        }
                    } else if (typeof obj === 'object') {
                        if (obj['@type'] === 'Recipe' || (Array.isArray(obj['@type']) && obj['@type'].includes('Recipe'))) {
                            return obj;
                        }
                        // Check nested graph
                        if (obj['@graph']) {
                            return findRecipe(obj['@graph']);
                        }
                    }
                    return null;
                };

                const found = findRecipe(parsed);
                if (found) {
                    recipeData = found;
                    return false; // Break the cheerio loop
                }
            } catch (err) {
                // Ignore JSON parse errors on invalid blocks
            }
        });

        if (!recipeData) {
            return null;
        }

        // Process and normalize the extracted recipe
        let image = '';
        if (recipeData.image) {
            if (typeof recipeData.image === 'string') {
                image = recipeData.image;
            } else if (Array.isArray(recipeData.image)) {
                image = recipeData.image[0];
            } else if (recipeData.image.url) {
                image = recipeData.image.url;
            }
        }

        let instructions = [];
        if (recipeData.recipeInstructions) {
            if (Array.isArray(recipeData.recipeInstructions)) {
                instructions = recipeData.recipeInstructions.map((step: any) =>
                    typeof step === 'string' ? step : step.text
                );
            } else {
                instructions = [recipeData.recipeInstructions];
            }
        }

        return {
            name: recipeData.name,
            description: recipeData.description,
            image,
            recipeIngredient: recipeData.recipeIngredient || [],
            recipeInstructions: instructions,
            prepTime: recipeData.prepTime,
            cookTime: recipeData.cookTime,
            totalTime: recipeData.totalTime,
            recipeYield: recipeData.recipeYield,
            url: url,
        };
    } catch (error) {
        console.error('Extraction Error:', error);
        return null;
    }
}
