import { extractRecipeFromUrl } from './parser';

async function test() {
    const data = await extractRecipeFromUrl('https://foodbyjos.de/grundrezept-dinkel-toastbrot-einfach-selbstgemacht/');
    console.log(JSON.stringify(data, null, 2));
}

test();
