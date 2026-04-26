import type {Group} from './puzzleCreator';

export const easy: Group[] = [
    {name: "regional", description: "Regional form"},
];
export const medium: Group[] = [
   {name: "alola", description: "Has Alolan variant"},
    {name: "galar", description: "Has Galarian variant"},
    {name: "hisui", description: "Has Hisuian variant"},
];
export const hard: Group[] = [
    {name: "battle", description: "Form change (in battle)"},
    {name: "change", description: "Form change (outside of battle)"},
    {name: "fixed", description: "Has natural form differences"},
];
export const challenge: Group[] = [
    {name: "mega", description: "Mega-Evolve"},
    {name: "gmax", description: "G-Max form"},
];

const disabled: Group[] = [
    // Only 2
    {name: "paldea", description: "Has a Paldean form"},
    // Legendary only
    {name: "fusion", description: "Can be fused with another Pokémon"},
    {name: "fused", description: "Formed by fusing two other Pokémon"},
    {name: "primal", description: "Can undergo primal reversion"},
    // Unused
    {name: "other", description: "Unspecified form difference"},
]