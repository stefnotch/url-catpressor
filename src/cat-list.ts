const CatNoises = [...pluralize("Blep", "Mlem", "Purr", "Purrr", "Purrrr", "Meow", "Mew", "Miau", "Trill", "Nya")];
const CatNames = [
  "Meowing",
  "Poki",
  "Bastet",
  "Sekhmet",
  "Feline",
  "Neko",
  "Cat",
  "Cats",
  "Catto",
  "Kitten",
  "Kittens",
  "Muzi",
  "Katze",
  "Gadse",
  "Gato",
  "Gatito",
  "Pusa",
  "Kuting",
  "Chat",
  "Koneko",
  "Nyan Cat",
  "House Cat",
  "Tabby",
  ...pluralize(
    "Tabby Cat",
    "White Cat",
    "SIC",
    "Standard Issue Cat",
    "Orange Cat",
    "Black Cat",
    "Void Cat",
    "Tortoiseshell Cat",
    "Tortie",
    "Calico"
  ),
  "Manul",
  "Tigers",
  "Lions",
  "Cheetahs",
  "Maine Coons",
  "Khajiit",
];
const CatMisc = [
  "🐈",
  "🐱",
  ...pluralize("Paw", "Tail", "Chimken", "Claw", "Catculation", "Catnip", "Catfruit"),
  "Jellybeans",
  "Kibble",
  "Kneading",
  "Loaf",
  "Wiggle",
  "Floofball",
  "Litter",
  "Fur",
  "Smol",
  "Whiskers",
  "Fluffy",
  "Boop",
  "UwU",
  "OwO",
];
/**
 * Sources
 * https://en.wikipedia.org/wiki/List_of_cat_breeds
 * https://en.wikipedia.org/wiki/List_of_felids
 * and some hand editing
 */
const CatPedia = [
  "Abyssinian",
  "Aegean Cat",
  "American Bobtail",
  "American Curl",
  "American Ringtail",
  "American Shorthair",
  "American Wirehair",
  "Aphrodite Giant",
  "Arabian Mau",
  "Asian Cat",
  "Asian Semi-longhair",
  "Australian Mist",
  "Balinese",
  "Bengal Cat",
  "Bengal Tiger",
  "Birman",
  "Bombay Cat",
  "Brazilian Shorthair",
  "British Longhair",
  "British Shorthair",
  "Burmese",
  "Burmilla",
  "California Spangled",
  "Chantilly-Tiffany",
  "Chartreux",
  "Chausie",
  "Colorpoint Shorthair",
  "Cornish Rex",
  "Cymric",
  "Cyprus Cat",
  "Devon Rex",
  "Dragon Li",
  "Egyptian Mau",
  "European Shorthair",
  "Exotic Shorthair",
  "Foldex",
  "German Rex",
  "Havana Brown",
  "Highlander Cat",
  "Himalayan Cat",
  "Japanese Bobtail",
  "Javanese",
  "Kanaani",
  "Khao Manee",
  "Kinkalow",
  "Korat",
  "Korean Bobtail",
  "Korn Ja",
  "Kurilian Bobtail or",
  "Kuril Islands Bobtail",
  "Lambkin",
  "LaPerm",
  "Lykoi",
  "Maine Coon",
  "Manx",
  "Mekong Bobtail",
  "Minskin",
  "Minuet",
  "Munchkin",
  "Nebelung",
  "Norwegian Forest Cat",
  "Ocicat",
  "Ojos Azules",
  "Oregon Rex",
  "Oriental Bicolor",
  "Oriental Longhair",
  "Oriental Shorthair",
  "Persian",
  "Peterbald",
  "Pixie-bob",
  "Ragamuffin",
  "Ragdoll",
  "Raas Cat",
  "Russian Blue",
  "Russian White",
  "Russian Black",
  "Russian Tabby",
  "Sam Sawet",
  "Savannah",
  "Scottish Fold",
  "Selkirk Rex",
  "Serengeti",
  "Serrade Petit",
  "Siamese",
  "Siberian",
  "Neva Masquerade",
  "Singapura",
  "Snowshoe Cat",
  "Sokoke",
  "Somali Cat",
  "Sphynx",
  "Suphalak",
  "Wichien Maat",
  "Thai Lilac",
  "Tonkinese",
  "Toybob",
  "Toyger",
  "Turkish Angora",
  "Turkish Van",
  "Turkish Vankedisi",
  "Ukrainian Levkoy",
  "York Chocolate",
  // -- //

  "Felinae",
  "Pantherinae",
  // -- //
  "Bay cat",
  "Caracal",
  "Ocelot",
  "Puma",
  "Panthera",
  // -- //
  "Catopuma",
  "Pardofelis",
  "Caracal",
  "Leptailurus",
  "Leopardus",
  "Lynx",
  "Acinonyx",
  "Herpailurus",
  "Puma",
  "Otocolobus",
  "Prionailurus",
  "Felis",
  "Neofelis",
  "Panthera",
  // -- //

  "Asian golden cat",
  "Bay cat",
  "Marbled cat",
  "African golden cat",
  "Caracal",
  "Serval",
  "Andean mountain cat",
  "Geoffroy cat",
  "Kodkod",
  "Margay",
  "Ocelot",
  "Oncilla",
  "Pampas cat",
  "Southern tiger cat",
  "Bobcat",
  "Canada lynx",
  "Eurasian lynx",
  "Iberian lynx",
  "Cheetah",
  "Jaguarundi",
  "Cougar",
  "Pallas cat",
  "Fishing cat",
  "Flat-headed cat",
  "Leopard cat",
  "Rusty-spotted cat",
  "Sunda leopard cat",
  "African wildcat",
  "Black-footed cat",
  "Chinese mountain cat",
  "Domestic cat",
  "European wildcat",
  "Jungle cat",
  "Sand cat",
  "Clouded leopard",
  "Sunda clouded leopard",
  "Jaguar",
  "Leopard",
  "Lion",
  "Snow leopard",
  "Tiger",
];

export const CatWords = fixWords([...new Set(CatMisc.concat(CatNoises).concat(CatNames).concat(CatPedia))]);

console.log(CatWords);

const catWordDuplicates = new Set<string>();
CatWords.forEach((word) => {
  word = word.toLowerCase();
  if (catWordDuplicates.has(word)) {
    console.log(`Duplicate word: ${word}`);
  } else {
    catWordDuplicates.add(word);
  }
});

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

function pluralize(...words: string[]) {
  return words.flatMap((word) => {
    if (word.endsWith("s")) {
      return [word];
    }
    return [word, word + "s"];
  });
}

function fixWords(words: string[]) {
  return words.map((word) => {
    return word.replaceAll(/\s|-/g, "_");
  });
}
