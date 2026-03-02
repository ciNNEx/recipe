"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = require("./parser");
async function test() {
    const data = await (0, parser_1.extractRecipeFromUrl)('https://foodbyjos.de/grundrezept-dinkel-toastbrot-einfach-selbstgemacht/');
    console.log(JSON.stringify(data, null, 2));
}
test();
