import './style.css'
import { PokemonClient } from 'pokenode-ts';

interface Pokemon {
  id: number;
  name: string;
  group: string;
  spriteUrl?: string;
  htmlElement?: HTMLElement;
}

let groups: string[] = [
  "Fire", "Grass", "Water", "Normal"
];

let puzzleData: Pokemon[] = [
  { id: 1, name: "Charmander", group: "Fire" },
  { id: 2, name: "Cyndaquil", group: "Fire" },
  { id: 3, name: "Torchic", group: "Fire" },
  { id: 4, name: "Fuecoco", group: "Fire" },
  { id: 5, name: "Bulbasaur", group: "Grass" },
  { id: 6, name: "Chikorita", group: "Grass" },
  { id: 7, name: "Treecko", group: "Grass" },
  { id: 8, name: "Turtwig", group: "Grass" },
  { id: 9, name: "Squirtle", group: "Water" },
  { id: 10, name: "Totodile", group: "Water" },
  { id: 11, name: "Empoleon", group: "Water" },
  { id: 12, name: "Froakie", group: "Water" },
  { id: 13, name: "Rattata", group: "Normal" },
  { id: 14, name: "Sentret", group: "Normal" },
  { id: 15, name: "Zigzagoon", group: "Normal" },
  { id: 16, name: "Bidoof", group: "Normal" },
];

const victory = document.querySelector<HTMLDivElement>('#victory')!;
const board = document.querySelector<HTMLDivElement>('#game-board')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn')!;
const iconsBtn = document.querySelector<HTMLButtonElement>('#icons-btn')!;

const settingsDialog = document.querySelector<HTMLDialogElement>('#settings')!;
const settingsBtn = document.querySelector<HTMLButtonElement>('#settings-btn')!;
const shuffleBtn = document.querySelector<HTMLButtonElement>('#shuffle-btn')!;
const closeBtn = document.querySelector<HTMLButtonElement>('#close-btn')!;

const api = new PokemonClient();

let unsolvedIds: number[] = [];
let solvedIds: number[] = [];
let selectedIds: number[] = [];
let useOfficialArt = false;

/////////////////////////////
// Submit
/////////////////////////////

submitBtn.addEventListener('click', () => {
  // Disable submit button to prevent double clicks
  submitBtn.disabled = true;

  if (selectedIds.length !== 4) {
    console.log('error: Please select exactly 4 tiles!');
    return;
  }

  const firstGroup = getPokemon(selectedIds[0]).group;
  const isCorrect = selectedIds.every(id => getPokemon(id).group === firstGroup);

  if (isCorrect) {
    handleCorrectGuess(firstGroup);
  } else {
    handleWrongGuess();
  }
});

function handleCorrectGuess(groupName: string) {
  markSelectedAsSolved();
  drawBoard();
  if (unsolvedIds.length === 0) {
    handleWin();
  }
}

function handleWin() {
  victory.textContent = 'You Win!';
}

function handleWrongGuess() {
  // Shake the tiles
  for (const id of selectedIds) {
    const element = getPokemon(id).htmlElement;
    if (!element) continue;
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
  }
  resetSelection();
}

/////////////////////////////
// Shuffle Logic
/////////////////////////////

shuffleBtn.addEventListener('click', () => {
  shuffle();
  drawBoard();
});

function shuffle() {
  resetSelection();
  unsolvedIds.sort(() => Math.random() - 0.5);
}

/////////////////////////////
// Selection Logic
/////////////////////////////

function toggleSelect(id: number) {
  const isSelected = selectedIds.includes(id);
  const isUnsolved = unsolvedIds.includes(id);
  const isMaxReached = selectedIds.length < 4;

  if (!isUnsolved || isSelected) {
    deselect(id);
  } else if (isMaxReached) {
    select(id);
  }
  // Enable submit button only when 4 tiles are selected
  submitBtn.disabled = selectedIds.length !== 4;
}

function select(id: number) {
  selectedIds.push(id);
  updateStyling(id);
}

function deselect(id: number) {
  selectedIds = selectedIds.filter(selectedId => selectedId !== id);
  updateStyling(id);
}

function markSelectedAsSolved() {
  while (selectedIds.length !== 0) {
    // Remove it from the selected list
    const id = selectedIds[0];
    deselect(id);

    // Move to solved list
    unsolvedIds = unsolvedIds.filter(uId => uId !== id);
    solvedIds.push(id);

    // Handle styling
    updateStyling(id);
  }
}

function resetSelection() {
  while (selectedIds.length !== 0) {
    deselect(selectedIds[0]);
  }
  submitBtn.disabled = true;
}

/////////////////////////////
// Settings
/////////////////////////////

settingsBtn.addEventListener('click', () => {
  settingsDialog.showModal();
});

closeBtn.addEventListener('click', () => {
  settingsDialog.close();
});

settingsDialog.addEventListener('click', (e) => {
  if (e.target === settingsDialog) {
    settingsDialog.close();
  }
});

iconsBtn.addEventListener('click', () => {
  useOfficialArt = !useOfficialArt;
  refreshArtwork();
});

async function refreshArtwork() {
  await initTileElements();
  drawBoard();
}

/////////////////////////////
// Utility
/////////////////////////////

function getPokemon(id: number): Pokemon {
  const pokemon = puzzleData.find(p => p.id === id);
  if (!pokemon) {
    throw new Error(`Pokemon with ID ${id} not found in puzzleData!`);
  }
  return pokemon;
}

/////////////////////////////
// Puzzle Builder
/////////////////////////////

function createNewPuzzle() {
  solvedIds = [];
  selectedIds = [];
  unsolvedIds = puzzleData.map(p => p.id);
}

/////////////////////////////
// Initialize
/////////////////////////////

async function init() {
  createNewPuzzle();
  await initTileElements();
  shuffle();
  drawBoard();
}

async function initTileElements() {
  // Wait for the sprites to be retrieved.
  await fetchSprites();

  puzzleData.forEach(pokemon => {
    const element = document.createElement('div');
    element.classList.add('tile');

    // Create image element
    const img = document.createElement('img');
    img.src = pokemon.spriteUrl || '';
    img.alt = pokemon.name;
    img.classList.add('pokemon-sprite');

    element.appendChild(img);
    pokemon.htmlElement = element;
    element.addEventListener('click', () => toggleSelect(pokemon.id));
    updateStyling(pokemon.id);
  });
}

async function fetchSprites() {
  // Fetch all sprites in parallel
  puzzleData = await Promise.all(
    puzzleData.map(async (p) => ({
      ...p,
      spriteUrl: await getPokemonSprite(p.name)
    }))
  );
}

async function getPokemonSprite(name: string): Promise<string> {
  // Retrieve the pokemon from PokeAPI
  const pokemon = await api.getPokemonByName(name)
    .catch((error) => {
      console.error("Failed to fetch " + name, error);
      return null;
    });
  if (!pokemon) {
    console.error("Failed to fetch " + name);
    return name;
  }
  // Return the sprint in the chosen style
  if (useOfficialArt) {
    return pokemon.sprites.other!["official-artwork"].front_default!;
  }
  return pokemon.sprites.front_default!;
}

function updateStyling(id: number) {
  const element = getPokemon(id).htmlElement;
  if (!element) return;

  const isSelected = selectedIds.includes(id);
  const isSolved = solvedIds.includes(id);

  if (isSolved) {
    element.classList.remove('selected');
    element.classList.remove('unselected');
    switch (getPokemon(id).group) {
      case groups[0]: element.classList.add('solved1'); break;
      case groups[1]: element.classList.add('solved2'); break;
      case groups[2]: element.classList.add('solved3'); break;
      case groups[3]: element.classList.add('solved4'); break;
      default: element.classList.add('solved1');
    }
  } else if (isSelected) {
    element.classList.add('selected');
    element.classList.remove('unselected');
  } else {
    element.classList.remove('selected');
    element.classList.add('unselected');
  }

  // Keep sprite art pixilated;
  if (useOfficialArt) {
    element.classList.remove('pixelated');
  } else {
    element.classList.add('pixelated');
  }

}

function drawBoard() {
  // Clear board
  board.innerHTML = '';

  // Keep a counter to know on which row we are
  // It starts at 4, so it will immediately roll over to the next row.
  let columnCounter: number = 0;
  let rowCounter: number = 0;

  // Build the board
  solvedIds.forEach((id) => {
    const pokemon = getPokemon(id);
    columnCounter++;
    if (columnCounter % 4 === 1) {
      rowCounter++;
      const label = addLabel(pokemon.group);
      label.style.gridRow = "" + rowCounter;
      label.style.gridColumn = "1 / 5";
      board.appendChild(label);
    }
    if (pokemon.htmlElement) {
      pokemon.htmlElement.style.gridRow = "" + rowCounter;
      pokemon.htmlElement.style.gridColumn = "" + (1 + columnCounter % 4);
      board.appendChild(pokemon.htmlElement);
    }
  });

  unsolvedIds.forEach((id) => {
    const pokemon = getPokemon(id);
    columnCounter++;
    if (columnCounter % 4 === 1) {
      rowCounter++;
    }
    if (pokemon.htmlElement) {
      pokemon.htmlElement.style.gridRow = "" + rowCounter;
      pokemon.htmlElement.style.gridColumn = "" + (1 + columnCounter % 4);
      board.appendChild(pokemon.htmlElement);
    }
  });
}

function addLabel(group: string) {
  const element = document.createElement('div');
  element.classList.add('solved-banner');
  switch (group) {
    case groups[0]: element.classList.add('solved1'); break;
    case groups[1]: element.classList.add('solved2'); break;
    case groups[2]: element.classList.add('solved3'); break;
    case groups[3]: element.classList.add('solved4'); break;
    default: element.classList.add('solved1');
  }
  element.textContent = group;
  return element;
}

init();