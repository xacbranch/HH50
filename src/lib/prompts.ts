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

/**
 * Get a random full_prompt for a given era + region.
 * Each combo has 5 variants × 3 shoot types (outdoor/studio/props) = 15 options.
 * We pick one at random for maximum variety.
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
  console.log(
    `[prompt] era=${era} region=${region} variant=${pick.variant} shoot=${pick.shoot_type} (${matches.length} options)`
  );
  return pick.full_prompt;
}
