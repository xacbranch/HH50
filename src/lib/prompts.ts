import "server-only";
import { readFileSync } from "fs";
import { join } from "path";
import type { Era, Region } from "./prompt-data";

interface PromptRow {
  era: string;
  region: string;
  variant: string;
  shoot_type: string;
  clothes: string;
  background: string;
  full_prompt: string;
}

// Handle quoted CSV fields (supports escaped quotes, multiline values)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseCSV(): PromptRow[] {
  const csvPath = join(process.cwd(), "src", "lib", "album_cover_prompts.csv");
  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const headers = parseCSVLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = (values[i] || "").trim();
    });
    return row as unknown as PromptRow;
  });
}

let _rows: PromptRow[] | null = null;

function getRows(): PromptRow[] {
  if (!_rows) {
    _rows = parseCSV();
  }
  return _rows;
}

const REGION_MAP: Record<Region, string> = {
  east: "East",
  west: "West",
  south: "South",
  midwest: "Midwest",
  international: "International",
};

type Framing = "medium" | "medium-close" | "close-up";

/**
 * Randomly pick a framing type:
 *   50% medium (waist up — original)
 *   30% medium-close (chest up)
 *   20% close-up (shoulders/face)
 */
function pickFraming(): Framing {
  const roll = Math.random();
  if (roll < 0.5) return "medium";
  if (roll < 0.8) return "medium-close";
  return "close-up";
}

const FRAMING_TEXT: Record<Framing, string> = {
  medium: "Medium shot framed from the waist up.",
  "medium-close":
    "Medium close-up shot framed from the chest up, focusing on the upper body and face.",
  "close-up":
    "Close-up shot framed from the shoulders up, tight on the face and upper chest, intimate and iconic.",
};

/**
 * Lower-body keywords — if a comma-separated clothing item contains any of
 * these words it describes something below the waist and should be stripped
 * for tighter framings.
 */
const LOWER_BODY_KEYWORDS = [
  // pants / bottoms
  "pants", "pant", "jeans", "jean", "trousers", "trouser", "shorts",
  "bell bottoms", "bell-bottoms", "bellbottoms", "palazzo",
  "cargo pants", "cargo shorts", "joggers", "sweatpants",
  "leggings", "chinos", "khakis", "denim shorts",
  "corduroy", "wide-leg", "wide leg", "skinny", "slim-straight",
  "baggy jeans", "carpenter jeans",
  // skirts / dresses (rare but possible)
  "skirt",
  // shoes / footwear
  "boots", "boot", "sneakers", "sneaker", "shoes", "shoe",
  "timberland", "timbs", "air force", "shell-toe", "shell toe",
  "superstars", "cortez", "platform shoes", "platform boot",
  "foam runner", "rick owens", "maison margiela",
  "canvas sneaker", "combat boot",
  // socks
  "long socks", "tube socks",
  // belt (often describes waist-down fit)
  // NOT stripping belts — they can be visible in close-ups on outerwear
];

/**
 * Strip lower-body clothing items from a comma-separated clothes string.
 * We split on commas, check each item, and keep only upper-body pieces.
 */
function stripLowerBody(clothes: string): string {
  // Split on ", " or "," respecting "and" joins
  // The clothes strings use comma-separated lists, sometimes with "and" before the last item
  const items = clothes.split(/,\s*/).map((s) => s.trim()).filter(Boolean);

  const kept: string[] = [];
  for (const item of items) {
    const lower = item.toLowerCase();
    const isLowerBody = LOWER_BODY_KEYWORDS.some((kw) => lower.includes(kw));
    if (!isLowerBody) {
      kept.push(item);
    }
  }

  // If we stripped everything (unlikely), fall back to original
  if (kept.length === 0) return clothes;

  // Rejoin, clean up leading "and"
  let result = kept.join(", ");
  result = result.replace(/^and\s+/i, "");
  // Clean up trailing orphan "and"
  result = result.replace(/,\s*and\s*$/i, "");
  // Clean double commas
  result = result.replace(/,\s*,/g, ",");

  return result;
}

/**
 * Rewrite a full_prompt with a different framing.
 * - Swap the framing sentence
 * - For tighter framings, also rewrite the clothes portion to remove lower-body items
 */
function reframePrompt(
  fullPrompt: string,
  clothes: string,
  framing: Framing
): string {
  let prompt = fullPrompt;

  // 1. Replace the framing sentence
  prompt = prompt.replace(
    /Medium shot framed from the waist up\./i,
    FRAMING_TEXT[framing]
  );

  // 2. For tighter shots, strip lower-body clothing from the prompt
  if (framing !== "medium" && clothes) {
    const strippedClothes = stripLowerBody(clothes);
    if (strippedClothes !== clothes) {
      // The clothes appear in the prompt after "Change their clothes to "
      // and before the next sentence (". Place them" or ". They are")
      prompt = prompt.replace(clothes, strippedClothes);
    }
  }

  return prompt;
}

/**
 * Get a random full_prompt for a given era + region.
 * Each combo has 5 variants × 3 shoot types (outdoor/studio/props) = 15 options.
 * We pick one at random, then randomly vary the framing between medium,
 * medium-close, and close-up — stripping lower-body clothing for tighter shots.
 */
export function getRandomPrompt(era: Era, region: Region): string {
  const rows = getRows();

  const matches = rows.filter(
    (r) => r.era === era && r.region === REGION_MAP[region]
  );

  if (matches.length === 0) {
    throw new Error(`No prompts found for era=${era}, region=${region}`);
  }

  const pick = matches[Math.floor(Math.random() * matches.length)];
  const framing = pickFraming();
  const finalPrompt = reframePrompt(pick.full_prompt, pick.clothes, framing);

  console.log(
    `[prompt] era=${era} region=${region} variant=${pick.variant} shoot=${pick.shoot_type} framing=${framing} (${matches.length} options)`
  );
  return finalPrompt;
}
