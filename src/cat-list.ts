const CatNoises = ["Blep", "Mlem", "Purr", "Purrr", "Purrrr", "Meow", "Miau"];
const CatNames = [
  "Meowing",
  "Bastet",
  "Feline",
  "Neko",
  "Cat",
  "Kitten",
  "Muzi",
  "Gato",
  "Gatito",
  "Pusa",
  "Kuting",
  "Chat",
  "Koneko",
];
/**
 * Sources
 * https://en.wikipedia.org/wiki/List_of_cat_breeds
 * https://en.wikipedia.org/wiki/List_of_felids
 */
const CatPedia = [];

export const CatWords = ["🐈", "🐱", "Paws", "Fluffy", "Jellybeans"].concat(CatNoises).concat(CatNames);

export const CatLookalikes = [["🐱", "😸", "😹", "😺", "😻", "😼"]];

export const CatLookalikesMap = new Map<string, { index: number; lookalikes: string[] }>();

CatLookalikes.forEach((v) => {
  v.forEach((lookalike, i) => {
    if (CatLookalikesMap.has(lookalike)) {
      console.warn(`Duplicate lookalike: ${lookalike}`);
    }
    CatLookalikesMap.set(lookalike, { index: i, lookalikes: v });
  });
});
