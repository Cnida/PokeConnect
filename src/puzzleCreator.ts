import rawDex from './puzzledata.json';
import { easy, medium, hard, challenge } from './groups';

const pokedex = rawDex as JsonData[];
interface JsonData {
    name: string;
    groups?: string[];
}

export interface Puzzle {
    pokemon: Pokemon[];
    groups: Group[];
}

export interface Pokemon {
    id: number;
    name: string;
    group: Group;
    spriteUrl?: string;
    htmlElement?: HTMLElement;
}

export interface Group {
    name: string;
    description: string;
}

// Dummy data
const dummyGroups: Group[] = [
    { name: "Fire", description: "Fire Type" },
    { name: "Grass", description: "Grass Type" },
    { name: "Water", description: "Water Type" },
    { name: "Normal", description: "Normal Type" }
]
const dummyPokemon: Pokemon[] = [
    { id: 1, name: "Oricorio-baile", group: dummyGroups[0] },
    { id: 2, name: "Cyndaquil", group: dummyGroups[0] },
    { id: 3, name: "Torchic", group: dummyGroups[0] },
    { id: 4, name: "Fuecoco", group: dummyGroups[0] },
    { id: 5, name: "Bulbasaur", group: dummyGroups[1] },
    { id: 6, name: "Chikorita", group: dummyGroups[1] },
    { id: 7, name: "Treecko", group: dummyGroups[1] },
    { id: 8, name: "Turtwig", group: dummyGroups[1] },
    { id: 9, name: "Squirtle", group: dummyGroups[2] },
    { id: 10, name: "Basculin-white-striped", group: dummyGroups[2] },
    { id: 11, name: "Empoleon", group: dummyGroups[2] },
    { id: 12, name: "Froakie", group: dummyGroups[2] },
    { id: 13, name: "Furfrou", group: dummyGroups[3] },
    { id: 14, name: "Sentret", group: dummyGroups[3] },
    { id: 15, name: "Zigzagoon-galar", group: dummyGroups[3] },
    { id: 16, name: "Bidoof", group: dummyGroups[3] },
];

export function createPuzzle(): Puzzle {
    // Select 4 random groups
    let group1 = easy.toSorted(() => Math.random() - 0.5)[0];
    let group2 = medium.toSorted(() => Math.random() - 0.5)[0];
    let group3 = hard.toSorted(() => Math.random() - 0.5)[0];
    let group4 = challenge.toSorted(() => Math.random() - 0.5)[0];

    let group1Pokemon: JsonData[] = randomByGroup(group1.name);
    let group2Pokemon: JsonData[] = randomByGroup(group2.name);
    let group3Pokemon: JsonData[] = randomByGroup(group3.name);
    let group4Pokemon: JsonData[] = randomByGroup(group4.name);

    // Validate the groups
    let validate = true;
    let attempts = 0;
    
    let allMons: JsonData[] = [...group1Pokemon, ...group2Pokemon, ...group3Pokemon, ...group4Pokemon];
    while (validate && attempts < 100) {
        attempts++;
        validate = false;
        allMons = [...group1Pokemon, ...group2Pokemon, ...group3Pokemon, ...group4Pokemon];

        const g1Match = allMons.filter(p => p.groups?.includes(group1.name));
        if (g1Match.length > 4) {
            console.log("Invalid puzzle. Group " + group1.name + ": " + g1Match.map(p => p.name));
            group1 = easy.toSorted(() => Math.random() - 0.5)[0];
            group1Pokemon = randomByGroup(group1.name);
            validate = true;
        }
        const g2Match = allMons.filter(p => p.groups?.includes(group2.name));
        if (g2Match.length > 4) {
            console.log("Invalid puzzle. Group " + group2.name + ": " + g2Match.map(p => p.name));
            group2 = medium.toSorted(() => Math.random() - 0.5)[0];
            group2Pokemon = randomByGroup(group2.name);
            validate = true;
        }
        const g3Match = allMons.filter(p => p.groups?.includes(group3.name));
        if (g3Match.length > 4) {
            console.log("Invalid puzzle. Group " + group3.name + ": " + g3Match.map(p => p.name));
            group3 = hard.toSorted(() => Math.random() - 0.5)[0];
            group3Pokemon = randomByGroup(group3.name);
            validate = true;
        }
        const g4Match = allMons.filter(p => p.groups?.includes(group4.name));
        if (g4Match.length > 4) {
            console.log("Invalid puzzle. Group " + group4.name + ": " + g4Match.map(p => p.name));
            group4 = challenge.toSorted(() => Math.random() - 0.5)[0];
            group4Pokemon = randomByGroup(group4.name);
            validate = true;
        }
    }

    // This puzzle is valid, compile and return it
    let groups: Group[] = [group1, group2, group3, group4];
    let puzzle: Puzzle = {
        pokemon: [],
        groups: groups
    };

    addPokemonToPuzzle(puzzle, group1Pokemon, group1);
    addPokemonToPuzzle(puzzle, group2Pokemon, group2);
    addPokemonToPuzzle(puzzle, group3Pokemon, group3);
    addPokemonToPuzzle(puzzle, group4Pokemon, group4);

    return puzzle;
}

function randomByGroup(groupName: string): JsonData[] {
    // Filter, shuffle and pick 4
    return pokedex.filter(p => p.groups?.includes(groupName))
        .toSorted(() => Math.random() - 0.5)
        .slice(0, 4);
}

function addPokemonToPuzzle(puzzle: Puzzle, rawMonList: JsonData[], group: Group) {
    rawMonList.forEach(rawMon => {
        const pokemon: Pokemon = {
            id: puzzle.pokemon.length + 1,
            name: rawMon.name,
            group: group
        }
        puzzle.pokemon.push(pokemon);
    });
}