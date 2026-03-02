"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractRecipeFromUrl = extractRecipeFromUrl;
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
async function extractRecipeFromUrl(url) {
    try {
        const response = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
            timeout: 30000,
        });
        const html = response.data;
        const $ = cheerio.load(html);
        // Look for application/ld+json scripts
        let recipeData = null;
        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const text = $(el).html() || '';
                const parsed = JSON.parse(text);
                // JSON-LD can be an array of objects or a single object
                const findRecipe = (obj) => {
                    if (!obj)
                        return null;
                    if (Array.isArray(obj)) {
                        for (const item of obj) {
                            const res = findRecipe(item);
                            if (res)
                                return res;
                        }
                    }
                    else if (typeof obj === 'object') {
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
            }
            catch (err) {
                // Ignore JSON parse errors on invalid blocks
            }
        });
        if (!recipeData) {
            return null;
        }
        const parseISODuration = (durationStr) => {
            if (!durationStr || !durationStr.startsWith('P'))
                return durationStr;
            let hours = 0;
            let minutes = 0;
            const hoursMatch = durationStr.match(/(\d+)H/);
            if (hoursMatch)
                hours = parseInt(hoursMatch[1], 10);
            const minutesMatch = durationStr.match(/(\d+)M/);
            if (minutesMatch)
                minutes = parseInt(minutesMatch[1], 10);
            if (hours === 0 && minutes === 0)
                return '';
            if (hours > 0 && minutes > 0)
                return `${hours} hr ${minutes} min`;
            if (hours > 0)
                return `${hours} hr`;
            return `${minutes} min`;
        };
        const cleanHtmlText = (htmlText) => {
            if (!htmlText)
                return '';
            const $temp = cheerio.load(htmlText, null, false);
            return $temp.text().replace(/\s+/g, ' ').trim();
        };
        const splitHtmlInstructions = (htmlText) => {
            if (!htmlText)
                return [];
            const $temp = cheerio.load(htmlText, null, false);
            const steps = [];
            if ($temp('p, li').length > 0) {
                $temp('p, li').each((_, el) => {
                    const text = $temp(el).text().replace(/\s+/g, ' ').trim();
                    if (text)
                        steps.push(text);
                });
            }
            else {
                const text = $temp.html() || '';
                text.split(/<br\s*\/?>|\n/i).forEach(line => {
                    const clean = cheerio.load(line, null, false).text().replace(/\s+/g, ' ').trim();
                    if (clean)
                        steps.push(clean);
                });
            }
            return steps;
        };
        // Process Image
        let image = '';
        if (recipeData.image) {
            if (typeof recipeData.image === 'string') {
                image = recipeData.image;
            }
            else if (Array.isArray(recipeData.image)) {
                if (typeof recipeData.image[0] === 'string') {
                    image = recipeData.image[0];
                }
                else if (recipeData.image[0] && recipeData.image[0].url) {
                    image = recipeData.image[0].url;
                }
            }
            else if (recipeData.image.url) {
                image = recipeData.image.url;
            }
        }
        // Process Instructions
        let instructions = [];
        if (recipeData.recipeInstructions) {
            const rawInstructions = Array.isArray(recipeData.recipeInstructions)
                ? recipeData.recipeInstructions
                : [recipeData.recipeInstructions];
            rawInstructions.forEach((step) => {
                if (typeof step === 'string') {
                    instructions.push(...splitHtmlInstructions(step));
                }
                else if (step.text) {
                    instructions.push(...splitHtmlInstructions(step.text));
                }
                else if (step['@type'] === 'HowToSection' && Array.isArray(step.itemListElement)) {
                    step.itemListElement.forEach((subStep) => {
                        if (typeof subStep === 'string') {
                            instructions.push(...splitHtmlInstructions(subStep));
                        }
                        else if (subStep.text) {
                            instructions.push(...splitHtmlInstructions(subStep.text));
                        }
                    });
                }
            });
        }
        // Process Ingredients with Rescue Heuristic
        let ingredients = [];
        const rawIngredients = recipeData.recipeIngredient;
        if (rawIngredients) {
            if (Array.isArray(rawIngredients)) {
                ingredients = rawIngredients.map(cleanHtmlText).filter(Boolean);
            }
            else if (typeof rawIngredients === 'string') {
                ingredients = [cleanHtmlText(rawIngredients)];
            }
        }
        // Rescue missing measurements (e.g. schema only says 'Flour' but HTML says '500g Flour')
        const hasDigitsCount = ingredients.filter(ing => /\d/.test(ing)).length;
        if (ingredients.length > 0 && hasDigitsCount < ingredients.length / 2) {
            ingredients = ingredients.map(ing => {
                let rescued = ing;
                $('*').each((i, el) => {
                    if ($(el).children().length === 0) {
                        const text = $(el).text().trim();
                        if (text === ing || text.includes(ing)) {
                            const parent = $(el).closest('tr, li, p, .ingredient, .recipe-ingredient');
                            if (parent.length > 0) {
                                const parentText = parent.text().replace(/\s+/g, ' ').trim();
                                // Avoid pulling in massive containers
                                if (/\d/.test(parentText) && parentText.length < 150) {
                                    rescued = parentText;
                                    return false; // Break out of the cheerio loop
                                }
                            }
                        }
                    }
                });
                return rescued;
            });
        }
        const estimateTimeFromInstructions = (steps) => {
            let totalMinutes = 0;
            const timeRegex = /(\d+)\s*(minuten?|min|stunden?|std|hours?|hr|h)\b/gi;
            steps.forEach(step => {
                let match;
                while ((match = timeRegex.exec(step)) !== null) {
                    const val = parseInt(match[1], 10);
                    const unit = match[2].toLowerCase();
                    if (unit.startsWith('stunde') || unit.startsWith('std') || unit.startsWith('hour') || unit === 'h' || unit === 'hr') {
                        totalMinutes += val * 60;
                    }
                    else {
                        totalMinutes += val;
                    }
                }
            });
            if (totalMinutes === 0)
                return '';
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            if (hours > 0 && mins > 0)
                return `~${hours} hr ${mins} min`;
            if (hours > 0)
                return `~${hours} hr`;
            return `~${mins} min`;
        };
        const parsedPrep = parseISODuration(recipeData.prepTime);
        const parsedCook = parseISODuration(recipeData.cookTime);
        let parsedTotal = parseISODuration(recipeData.totalTime);
        if (!parsedPrep && !parsedCook && !parsedTotal && instructions.length > 0) {
            parsedTotal = estimateTimeFromInstructions(instructions);
        }
        return {
            name: cleanHtmlText(recipeData.name),
            description: cleanHtmlText(recipeData.description),
            image,
            recipeIngredient: ingredients,
            recipeInstructions: instructions.filter(Boolean),
            prepTime: parsedPrep,
            cookTime: parsedCook,
            totalTime: parsedTotal,
            recipeYield: recipeData.recipeYield,
            url: url,
        };
    }
    catch (error) {
        console.error('Extraction Error:', error);
        return null;
    }
}
