import "server-only";
import { readFileSync } from "fs";
import { join } from "path";
import type { Era, Region } from "./prompt-data";

interface PromptRow {
  era: string;
  region: string;
  variant: string;
  clothes: string;
  background: string;
  full_prompt: string;
}

// Handle quoted CSV fields
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

/**
 * Get a random full_prompt for a given era + region.
 * Each combo has 5 variants; we pick one at random.
 */
export function getRandomPrompt(era: Era, region: Region): string {
  const rows = getRows();
  const regionMap: Record<Region, string> = {
    east: "East",
    west: "West",
    south: "South",
    midwest: "Midwest",
    international: "International",
  };

  const matches = rows.filter(
    (r) => r.era === era && r.region === regionMap[region]
  );

  if (matches.length === 0) {
    throw new Error(`No prompts found for era=${era}, region=${region}`);
  }

  const pick = matches[Math.floor(Math.random() * matches.length)];
  return pick.full_prompt;
}
