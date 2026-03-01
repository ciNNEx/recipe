import express from 'express';
import cors from 'cors';
import { extractRecipeFromUrl } from './parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/parse-recipe', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const recipe = await extractRecipeFromUrl(url);

        if (!recipe) {
            return res.status(404).json({ error: 'Could not extract recipe from URL' });
        }

        res.json({ recipe });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
