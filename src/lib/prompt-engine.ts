import "server-only";
import { readFileSync } from "fs";
import { join } from "path";
import type { Era, Region } from "./prompt-data";

// ============================================================
// PROMPT ENGINE v3 — CSV-driven randomized mix-and-match
// ============================================================
//
// Clothes are assembled from the rap-fashion CSV:
//   1 random Pants + 1 random Top + 1-2 random Accessories
//   All filtered by era + region for cultural accuracy
//
// Backgrounds, mood, photo style, framing, realism — hardcoded
// ============================================================

// ---- CSV LOADING ----

interface FashionItem {
  region: string;
  era_years: string;
  era_name: string;
  category: "Pants" | "Tops" | "Accessories";
  item_description: string;
}

let _items: FashionItem[] | null = null;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function loadCSV(): FashionItem[] {
  if (_items) return _items;
  const csvPath = join(process.cwd(), "src", "lib", "rap-fashion.csv");
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const headers = parseCSVLine(lines[0]);

  _items = lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = vals[i] || ""));
    return row as unknown as FashionItem;
  });
  return _items;
}

// ---- ERA + REGION MAPPING ----

const CSV_REGION_MAP: Record<Region, string[]> = {
  east: ["East Coast"],
  west: ["West Coast"],
  south: ["South"],
  midwest: ["Midwest"],
  international: ["London", "Paris", "Tokyo"],
};

// Map app eras to CSV era_years ranges by start year
function eraMatchesAppEra(csvEraYears: string, appEra: Era): boolean {
  const start = parseInt(csvEraYears.split("-")[0], 10);
  switch (appEra) {
    case "70s": return start >= 1975 && start < 1985;
    case "80s": return start >= 1983 && start < 1993;
    case "90s": return start >= 1989 && start < 2003;
    case "00s": return start >= 2000 && start < 2010;
    case "10s": return start >= 2010;
  }
}

function getItems(era: Era, region: Region, category: string): string[] {
  const items = loadCSV();
  const csvRegions = CSV_REGION_MAP[region];
  return items
    .filter(
      (item) =>
        csvRegions.includes(item.region) &&
        eraMatchesAppEra(item.era_years, era) &&
        item.category === category
    )
    .map((item) => item.item_description);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- BUILD OUTFIT ----

function buildOutfit(era: Era, region: Region): string {
  const pants = getItems(era, region, "Pants");
  const tops = getItems(era, region, "Tops");
  const accessories = getItems(era, region, "Accessories");

  const parts: string[] = [];

  if (pants.length > 0) parts.push(pickRandom(pants));
  if (tops.length > 0) parts.push(pickRandom(tops));

  // Pick 1-2 accessories
  if (accessories.length > 0) {
    const acc1 = pickRandom(accessories);
    parts.push(acc1);
    if (accessories.length > 1 && Math.random() < 0.6) {
      let acc2 = pickRandom(accessories);
      let attempts = 0;
      while (acc2 === acc1 && attempts < 5) {
        acc2 = pickRandom(accessories);
        attempts++;
      }
      if (acc2 !== acc1) parts.push(acc2);
    }
  }

  // Fallback if CSV has no data for this combo
  if (parts.length === 0) {
    return "era-appropriate hip hop clothing";
  }

  return parts.join(", ");
}

// ---- REGION BACKGROUNDS (5 per region) ----

const REGION_BACKGROUNDS: Record<Region, string[]> = {
  east: [
    "on a Harlem brownstone stoop in winter, breath visible in the cold air, project towers rising in the background, a Lincoln Town Car idling at the curb with the engine running",
    "in front of the Queensbridge Houses courtyard, chain-link fence behind them, concrete everywhere, a bodega on the corner with the awning half-torn, the East River visible in the distance",
    "on a Brooklyn street corner at night under a single streetlight, a row of brownstones stretching into darkness, fire escapes zigzagging up the buildings, steam rising from a subway grate",
    "leaning against a graffiti-covered wall in the South Bronx, a handball court behind them, project towers in the background, trash cans and milk crates scattered on the sidewalk",
    "standing outside a Harlem barbershop at dusk, neon signs glowing in the window, an old-school Cadillac parked on the street, the sidewalk wet from rain",
  ],
  west: [
    "on East LA's Whittier Boulevard at dusk, a 1964 Chevy Impala SS on hydraulics with the front end jacked up parked at the curb, murals of Aztec warriors and the Virgin Mary painted on the cinder block wall behind, taco stands with bare bulb string lights, cholos posted up on the sidewalk, the whole block smelling like carne asada",
    "on Crenshaw Boulevard in front of the Crenshaw Mall parking lot, a candy-painted '72 Caprice on Daytons three-wheeling down the strip, the barbershop and liquor store signs glowing, palm trees lining the median, that golden LA light cutting through the smog at magic hour",
    "on International Boulevard in East Oakland at night, a scraper Buick Regal on 22s with the trunk rattling, sideshow donuts still smoking on the asphalt, a liquor store and a taqueria neon signs bleeding together, fog rolling in from the Bay",
    "in the Fillmore District in San Francisco, Victorian row houses painted in faded pastels behind them, a hyphy-era Cutlass on gold Daytons parked on the hill, the fog thick and low, streetlights glowing through the mist, the Western Addition before it got gentrified",
    "on MacArthur Boulevard in deep East Oakland, a sideshow pit with tire marks spiraling across the intersection, a ghostride whip rolling slow with the door open, street poles wrapped in RIP memorial flyers, the Oakland hills visible in the smoky distance",
  ],
  south: [
    "in a Houston gas station parking lot at 3am under fluorescent canopy lights, a candy-painted slab on 84s with swangas poking out parked at the pump, trunk popped showing subwoofers, heat shimmer rising off the asphalt",
    "on a Memphis side street at dusk with shotgun houses lining both sides, a Chevy Caprice on 24-inch rims parked crooked on the curb, Spanish moss hanging from a live oak tree, the humid sky orange and purple",
    "in a Dallas strip mall parking lot at night, neon signs from a wing spot and a barbershop glowing behind them, a lifted Chevy Suburban on chrome wheels parked with the doors open and bass rattling",
    "outside an Atlanta club entrance at 2am with a line wrapped around the building, a black Escalade on 26s idling out front, neon pink light spilling out the door, moths circling the light poles",
    "on a Houston boulevard lined with car dealerships and pawn shops, a candy-painted Cadillac on swangas rolling past, the Houston skyline glowing in the humid night air behind them",
  ],
  midwest: [
    "on a Chicago South Side street in winter, grey overcast sky, breath visible, brick row houses with iron fences, a Chevy Impala parked on the street with snow on the hood",
    "in a Detroit alley behind a shuttered factory, brick walls tagged with graffiti, chain-link fence with barbed wire, a Buick Regal on chrome wheels parked in the broken lot, the sky flat and grey",
    "on a Minneapolis block at dusk, bare trees lining the street, old brick buildings with boarded windows, a Pontiac Grand Prix on chrome rims parked under a flickering streetlight",
    "in front of a Chicago corner store in autumn, leaves on the ground, project buildings in the background, a Dodge Charger with tinted windows idling at the curb, the sky overcast and heavy",
    "on an empty lot in Detroit with weeds pushing through cracked concrete, abandoned houses visible down the block, a Cutlass Supreme on spokes parked on the grass, the industrial skyline behind them",
  ],
  international: [
    "on a Tokyo side street at night in Shibuya, neon kanji signs reflected in rain puddles, vending machines glowing, a JDM sedan parked under a narrow overhang, the city humming",
    "in a Paris banlieue concrete courtyard, brutalist apartment towers rising behind them, graffiti on the stairwell walls, a Peugeot 205 parked on the curb, fluorescent light from a doorway",
    "on a London council estate walkway, concrete balconies stacking up above them, laundry hanging from railings, a BMW 3 Series parked below, grey sky and drizzle",
    "in a Lagos street at golden hour, colorful market stalls and corrugated metal roofs behind them, a Mercedes W124 parked on red dirt, palm trees and satellite dishes on rooftops",
    "on a São Paulo overpass at dusk, the favela sprawling below with lights flickering on, graffiti murals covering the concrete walls, a VW Gol parked on the shoulder, the city glowing amber",
  ],
};

// ---- REGION MOOD ----

const REGION_MOOD: Record<Region, string> = {
  east: "The mood channels raw East Coast energy — cold blue winter light, concrete and iron, steam from grates, the stark visual language of Jamel Shabazz and Chi Modu's New York street photography",
  west: "The mood channels West Coast hip hop — East LA lowrider culture meets Bay Area sideshow energy, golden hour smog light in the south and cold fog in the north, the unflinching eye of Estevan Oriol's East LA portraits and the raw Bay Area documentation of street life",
  south: "The mood channels Dirty South energy — humid night glow, candy paint and swangas, neon strip mall light, the heat you can feel in the frame",
  midwest: "The mood channels Midwest hip hop — grey overcast sky, brick and iron, chain-link fences, the quiet intensity of a Chicago or Detroit winter, breath visible in the cold air, no glamour just resolve",
  international: "The mood channels global hip hop — neon reflected in rain puddles, concrete and fluorescent light, cosmopolitan grit, the subject feels both local and from everywhere",
};

// ---- ERA PHOTO STYLE ----

const ERA_PHOTO_STYLE: Record<Era, string> = {
  "70s": "In the style of Joe Conzo's block party documentation and early Jamel Shabazz street portraits. Shot on a Contax G2 with on-camera flash, Kodak Tri-X 400 black and white film pushed to 1600. Harsh direct flash, deep blacks, gritty grain, documentary and unstaged",
  "80s": "In the style of Janette Beckman and Glen E. Friedman's confrontational portraits. Shot on a Contax G2 with on-camera flash, Kodak T-Max 400 black and white with high contrast printing. Direct flash against a gritty backdrop, posed but aggressive, arms crossed or gripping a mic",
  "90s": "In the style of Chi Modu and Danny Clinch's intimate sessions. Shot on a Contax G2 with on-camera flash, Kodak Portra 400 color film with warm skin tones and rich midtones. Moody sidelight, shallow depth of field, intimate and cinematic",
  "00s": "In the style of Jonathan Mannion's iconic cover shoots. Shot on a Contax G2 with on-camera flash, Fuji Superia 800 color film pushed warm. Hard direct flash overexposing the subject against a dark background, ice catching the light, flash-lit excess",
  "10s": "In the style of Gunner Stahl and Nabil Elderkin's atmospheric portraits. Shot on a Contax G2 with on-camera flash, Kodak Portra 800 color film with desaturated tones and lifted blacks. Soft natural light mixed with neon spill, melancholic and atmospheric",
};

// ---- FRAMING ----

type Framing = "wide" | "medium" | "medium-close" | "close-up";

function pickFraming(): Framing {
  const roll = Math.random();
  if (roll < 0.20) return "wide";
  if (roll < 0.55) return "medium";
  if (roll < 0.80) return "medium-close";
  return "close-up";
}

const FRAMING_TEXT: Record<Framing, string> = {
  wide: "Full body shot framed head to toe, showing the complete outfit including shoes. The subject stands confidently with their full look visible.",
  medium: "Medium shot framed from the waist up.",
  "medium-close": "Medium close-up shot framed from the chest up, focusing on the upper body and face.",
  "close-up": "Close-up shot framed from the shoulders up, tight on the face and upper chest, intimate and iconic.",
};

// For tighter framings, strip pants/shoes from the outfit string
function stripLowerBody(outfit: string): string {
  const items = outfit.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  const LOWER_KW = [
    "pants", "jeans", "trousers", "shorts", "joggers", "chinos", "khakis",
    "bell bottoms", "cargo", "denim short", "sweatpants", "track pants",
    "boots", "boot", "sneakers", "sneaker", "shoes", "shoe",
    "loafers", "moccasin", "slippers", "sandals",
  ];
  const kept = items.filter((item) => {
    const lower = item.toLowerCase();
    return !LOWER_KW.some((kw) => lower.includes(kw));
  });
  return kept.length > 0 ? kept.join(", ") : outfit;
}

// ---- REALISM ANCHOR ----

const REALISM = "This must look like an actual photograph — not a painting, illustration, or digital render. Real film grain, real lens distortion, real skin texture with pores and imperfections. Natural lighting falloff. No airbrushing, no glow effects, no fantasy elements, no surreal or impossible compositions. The background must be a real, physically possible location. Shoot it like a real photographer on a real street with a real camera. The subject's expression must be a hard, confident mean mug — no smiling, no grinning, no soft expressions. Jaw tight, eyes dead into the lens, the kind of face that says don't fuck with me. Think album cover intensity, not portrait studio pleasantness";

// ---- PROMPT ASSEMBLY ----

export function getRandomPrompt(era: Era, region: Region): string {
  // Build randomized outfit from CSV
  const outfit = buildOutfit(era, region);

  // Pick background
  const backgrounds = REGION_BACKGROUNDS[region];
  const background = pickRandom(backgrounds);

  // Mood + photo style
  const mood = REGION_MOOD[region];
  const photoStyle = ERA_PHOTO_STYLE[era];

  // Framing
  const framing = pickFraming();
  const framingText = FRAMING_TEXT[framing];

  // Strip lower-body for tighter shots
  const finalOutfit = (framing === "wide" || framing === "medium") ? outfit : stripLowerBody(outfit);

  const prompt = [
    `Take this exact person and place them into a hip hop album cover photograph.`,
    `Change their clothes to ${finalOutfit}.`,
    `Place them ${background}.`,
    `${mood}.`,
    `${photoStyle}.`,
    `${framingText}`,
    `${REALISM}.`,
    `No text or typography anywhere in the image.`,
    `Keep their likeness perfectly intact. Square 1:1 format.`,
  ].join(" ");

  console.log(`[prompt] era=${era} region=${region} framing=${framing} outfit=${finalOutfit.substring(0, 80)}...`);

  return prompt;
}
