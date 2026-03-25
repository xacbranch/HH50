import "server-only";
import type { Era, Region } from "./prompt-data";

// ============================================================
// PROMPT ENGINE — Modular template with era + region blocks
// ============================================================
//
// Template:
//   Take this exact person and place them into a hip hop album cover
//   photograph. Change their clothes to {CLOTHES}. Place them
//   {BACKGROUND}. {REGION_MOOD}. {PHOTO_STYLE}. {REALISM}.
//   {FRAMING}. No text or typography anywhere in the image.
//   Keep their likeness perfectly intact. Square 1:1 format.
//
// ERA controls: clothes (5 variants), photo style + film stock
// REGION controls: background (5 variants), mood
// Framing is randomized: medium / medium-close / close-up

// ============================================================
// ERA: CLOTHES (5 variants each)
// ============================================================

const ERA_CLOTHES: Record<Era, string[]> = {
  "70s": [
    "super wide bell bottoms, a shiny polyester shirt unbuttoned to the navel with a massive pointed collar, a floor-length fur coat draped off the shoulders, platform shoes, and a wide-brim hat cocked to the side",
    "high-waisted flared trousers with a razor crease, a skin-tight ribbed turtleneck, a full-length leather trench coat belted at the waist, and knee-high leather boots with a chunky heel",
    "an oversized dashiki hanging past the hips over extra-wide corduroy bell bottoms, a beaded kufi cap, wooden bead necklaces layered three deep, and suede desert boots",
    "a three-piece suit with lapels wide as airplane wings, a butterfly collar silk shirt, a pocket square bursting from the breast pocket, a fedora tilted way back, and two-tone spectator shoes",
    "a cropped halter vest showing chest, ultra-wide palazzo pants, a headband pushing back an afro, oversized tinted aviator glasses, and a single long chain with a medallion the size of a fist",
  ],
  "80s": [
    "a full Adidas tracksuit zipped halfway down over a thick gold rope chain, the jacket sleeves pushed up to the elbows, a Kangol bucket hat tilted back, and crisp white shell-toe Superstars with fat laces",
    "a custom leather bomber jacket covered in oversized luxury monogram print, door-knocker earrings, four-finger gold rings spelling a name, and high-top Nikes with the tongue out",
    "a massive shearling coat hanging to the knees, a beret pulled low over one eye, a nameplate chain in old english script, Cazal 607 glasses, and Puma Clydes",
    "a red and black leather 8-ball jacket three sizes too big, a fitted cap with the sticker still on, stone-wash jeans pegged at the ankle, and bright white Reebok Classics",
    "a floor-length black leather duster over a graphic Def Jam tee, high-waisted pleated trousers, a flat-top fade, oversized clock chain around the neck, and Timberland chukkas",
  ],
  "90s": [
    "a super baggy Dickies work shirt buttoned only at the top over a crisp white undershirt, enormous baggy jeans sagging with boxers showing, wheat Timberland boots with laces untied, a bandana folded and tied around the forehead, and a two-way pager on the belt",
    "a XXXL hockey jersey hanging to the knees, extra-wide carpenter jeans dragging on the ground with the cuffs shredded, a gold rope chain with a Jesus piece, and scuffed-up Reeboks",
    "a quilted bubble vest over an oversized hoodie with the hood up, super baggy cargo pants with every pocket stuffed, a gold link bracelet, and suede Wallabees",
    "a triple-XL rugby shirt with horizontal stripes tucked into belted wide-leg khakis, a gold link bracelet, a pager clipped to the belt, and fresh white-on-white Air Force 1s",
    "a comically oversized denim jacket with the sleeves cuffed once over a thermal henley, dark baggy jeans with a razor crease, a beanie pulled low, and Clarks Wallabees",
  ],
  "00s": [
    "a tall white tee hanging almost to the knees, basketball shorts past the calves over long socks, an iced-out chain with a spinning medallion, a fitted cap slightly tilted, and crisp white Air Force 1 lows",
    "a full velour Juicy Couture tracksuit with the zipper halfway down showing a diamond-studded chain, rimless rectangular glasses, a diamond bezel watch, and alligator-skin loafers",
    "a throwback basketball jersey so big the armholes hang to the waist, super baggy denim shorts below the knee, a platinum chain with an iced-out cross, and butter-colored Timberlands",
    "a pink full-length fur coat over a fitted black tee, oversized aviator sunglasses with rose-tinted lenses, a skinny scarf hanging to the waist, and gator shoes",
    "a button-down shirt with only the top button done over a white tank, an iced-out rosary chain, wide-leg Rocawear jeans with massive embroidered back pockets, and white-on-white Forces",
  ],
  "10s": [
    "a long camel overcoat over an oversized hoodie with the strings hanging, skinny distressed black jeans with blown-out knees, high-top Rick Owens sneakers, face tattoos across the cheekbones, and a crossbody bag slung low",
    "a graphic tee tucked into leather pants, a chain hanging to the navel, chunky silver rings on every finger, combat boots with the tongues out, and a do-rag under a fitted cap",
    "an oversized tie-dye hoodie big enough to be a dress, baggy cargo pants stacked over chunky foam runner sneakers, painted fingernails, and face tattoos on the neck and hands",
    "a cropped puffer jacket over a mock-neck base layer, ultra-wide leg trousers puddling over platform boots, layered necklaces mixing pearls and chains, and tinted oval sunglasses",
    "a vintage band tee with the sleeves cut off over a long-sleeve thermal, slim-straight raw denim cuffed once, beat-up canvas sneakers, and a beanie with hair spilling out",
  ],
};

// South-specific overrides (grills, jerseys in 00s)
const SOUTH_CLOTHES_OVERRIDES: Partial<Record<Era, (string | null)[]>> = {
  "90s": [
    "a super baggy Dickies work shirt buttoned only at the top over a crisp white undershirt, enormous baggy jeans sagging, wheat Timberland boots with laces untied, a gold grill on the bottom row, a bandana tied around the forehead, and a two-way pager on the belt",
    "a XXXL Starter jacket with the hood up, extra-wide carpenter jeans dragging on the ground, a gold rope chain with a Jesus piece, a single gold tooth, and scuffed-up Reeboks",
    "a quilted bubble vest over an oversized hoodie with the hood up, super baggy cargo pants, a gold bottom grill, a gold link bracelet, and suede Wallabees",
    null, // use default
    null,
  ],
  "00s": [
    "a baggy throwback Dallas Cowboys jersey three sizes too big over a white tee, extra-long denim shorts past the knee, crisp white Air Force 1s, a diamond grill on the bottom teeth, and an iced-out chain with a Texas-shaped pendant",
    "a full velour tracksuit with the zipper halfway down showing a diamond-studded chain, rimless rectangular glasses, a diamond and gold grill gleaming, and alligator-skin boots",
    "a super baggy Houston Oilers throwback jersey hanging to the knees, extra-wide denim shorts below the knee, a platinum chain with an iced-out cross, a full gold grill, and butter-colored Timberlands",
    "a pink full-length fur coat over a fitted black tee, oversized aviator sunglasses with rose-tinted lenses, a bottom grill with diamond cuts, and gator shoes",
    "a button-down shirt with only the top button done over a white tank, an iced-out rosary chain, wide-leg jeans with massive embroidered back pockets, a permanent gold grill, and white-on-white Forces",
  ],
  "10s": [
    "a long camel overcoat over an oversized hoodie, skinny distressed black jeans, high-top designer sneakers, a VVS diamond grill, face tattoos across the cheekbones, and a crossbody bag slung low",
    "a graphic tee tucked into leather pants, a chain hanging to the navel, chunky silver rings on every finger, combat boots, a custom rainbow grill, and a do-rag under a fitted cap",
    "an oversized tie-dye hoodie big enough to be a dress, baggy cargo pants stacked over chunky foam runners, painted fingernails, a full iced-out grill, and face tattoos on the neck",
    null,
    null,
  ],
};

// ============================================================
// REGION: BACKGROUNDS (5 variants each)
// ============================================================

const REGION_BACKGROUNDS: Record<Region, string[]> = {
  east: [
    "on a Harlem brownstone stoop in winter, breath visible in the cold air, project towers rising in the background, a Lincoln Town Car idling at the curb with the engine running",
    "in front of the Queensbridge Houses courtyard, chain-link fence behind them, concrete everywhere, a bodega on the corner with the awning half-torn, the East River visible in the distance",
    "on a Brooklyn street corner at night under a single streetlight, a row of brownstones stretching into darkness, fire escapes zigzagging up the buildings, steam rising from a subway grate",
    "leaning against a graffiti-covered wall in the South Bronx, a handball court behind them, project towers in the background, trash cans and milk crates scattered on the sidewalk",
    "standing outside a Harlem barbershop at dusk, neon signs glowing in the window, an old-school Cadillac parked on the street, the sidewalk wet from rain",
  ],
  west: [
    "on a Los Angeles sidewalk at golden hour with palm trees lining the boulevard, a 1964 Chevy Impala on hydraulics parked at the curb, the sun low and hazy through smog",
    "in front of a Compton corner store with iron bars on the windows, a lowrider Cutlass parked on the street with Daytons, kids on bikes in the background, the golden California light hitting everything warm",
    "on Crenshaw Boulevard at sunset with the strip stretching behind them, a candy-painted Monte Carlo rolling past, palm trees silhouetted against an orange sky",
    "in the parking lot of a Watts housing project, chain-link fences and concrete, a Chevy Impala with the hydraulics raised on three wheels, the Los Angeles skyline faint in the smoggy distance",
    "on a Venice Beach boardwalk at dusk, graffiti murals behind them, skaters rolling past, a lowrider bicycle leaning against a palm tree, the Pacific Ocean visible in the background",
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

// ============================================================
// REGION: MOOD MODIFIERS
// ============================================================

const REGION_MOOD: Record<Region, string> = {
  east: "The mood channels raw East Coast energy — cold blue winter light, concrete and iron, steam from grates, the stark visual language of Jamel Shabazz and Chi Modu's New York street photography",
  west: "The mood channels West Coast hip hop — golden hour California light, lowriders, palm trees against smoggy orange sunset, the laid-back menace of Estevan Oriol and Mike Miller's photography",
  south: "The mood channels Dirty South energy — humid night glow, candy paint and swangas, neon strip mall light, the heat you can feel in the frame",
  midwest: "The mood channels Midwest hip hop — grey overcast sky, brick and iron, chain-link fences, the quiet intensity of a Chicago or Detroit winter, breath visible in the cold air, no glamour just resolve",
  international: "The mood channels global hip hop — neon reflected in rain puddles, concrete and fluorescent light, cosmopolitan grit, the subject feels both local and from everywhere",
};

// ============================================================
// ERA: PHOTO STYLE + FILM STOCK
// ============================================================

const ERA_PHOTO_STYLE: Record<Era, string> = {
  "70s": "In the style of Joe Conzo's block party documentation and early Jamel Shabazz street portraits. Shot on a Contax G2 with on-camera flash, Kodak Tri-X 400 black and white film pushed to 1600. Harsh direct flash, deep blacks, gritty grain, documentary and unstaged",
  "80s": "In the style of Janette Beckman and Glen E. Friedman's confrontational portraits. Shot on a Contax G2 with on-camera flash, Kodak T-Max 400 black and white with high contrast printing. Direct flash against a gritty backdrop, posed but aggressive, arms crossed or gripping a mic",
  "90s": "In the style of Chi Modu and Danny Clinch's intimate sessions. Shot on a Contax G2 with on-camera flash, Kodak Portra 400 color film with warm skin tones and rich midtones. Moody sidelight, shallow depth of field, intimate and cinematic",
  "00s": "In the style of Jonathan Mannion's iconic cover shoots. Shot on a Contax G2 with on-camera flash, Fuji Superia 800 color film pushed warm. Hard direct flash overexposing the subject against a dark background, ice catching the light, flash-lit excess",
  "10s": "In the style of Gunner Stahl and Nabil Elderkin's atmospheric portraits. Shot on a Contax G2 with on-camera flash, Kodak Portra 800 color film with desaturated tones and lifted blacks. Soft natural light mixed with neon spill, melancholic and atmospheric",
};

// ============================================================
// FRAMING
// ============================================================

type Framing = "wide" | "medium" | "medium-close" | "close-up";

/**
 * Random framing distribution:
 *   20% wide (full body, head to toe — shows shoes, pants, full outfit)
 *   35% medium (waist up — the classic album cover framing)
 *   25% medium-close (chest up — emphasizes jewelry, chains, upper layers)
 *   20% close-up (shoulders/face — intimate, iconic, tight crop)
 */
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

// Lower-body keywords to strip for tighter framings
const LOWER_BODY_KW = [
  "pants", "jeans", "trousers", "shorts", "bell bottoms", "palazzo",
  "cargo pants", "joggers", "leggings", "chinos", "khakis", "denim shorts",
  "boots", "boot", "sneakers", "sneaker", "shoes", "shoe",
  "timberland", "timbs", "air force", "shell-toe", "superstars", "cortez",
  "platform shoes", "foam runner", "rick owens", "maison margiela",
  "wallabees", "wallabee", "reeboks", "reebok", "puma", "nikes", "nike",
  "combat boot", "canvas sneaker", "forces", "loafers",
  "long socks", "tube socks",
];

function stripLowerBody(clothes: string): string {
  const items = clothes.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  const kept: string[] = [];
  for (const item of items) {
    const lower = item.toLowerCase();
    const isLower = LOWER_BODY_KW.some((kw) => lower.includes(kw));
    if (!isLower) kept.push(item);
  }
  if (kept.length === 0) return clothes;
  let result = kept.join(", ");
  result = result.replace(/^and\s+/i, "").replace(/,\s*and\s*$/i, "").replace(/,\s*,/g, ",");
  return result;
}

// ============================================================
// REALISM ANCHOR
// ============================================================

const REALISM = "This must look like an actual photograph — not a painting, illustration, or digital render. Real film grain, real lens distortion, real skin texture with pores and imperfections. Natural lighting falloff. No airbrushing, no glow effects, no fantasy elements, no surreal or impossible compositions. The background must be a real, physically possible location. Shoot it like a real photographer on a real street with a real camera";

// ============================================================
// PROMPT ASSEMBLY
// ============================================================

export function getRandomPrompt(era: Era, region: Region): string {
  // Pick random variant index (0-4)
  const variantIdx = Math.floor(Math.random() * 5);

  // Get clothes — check South overrides first
  let clothes: string;
  const southOverride = region === "south" ? SOUTH_CLOTHES_OVERRIDES[era]?.[variantIdx] : null;
  if (southOverride) {
    clothes = southOverride;
  } else {
    clothes = ERA_CLOTHES[era][variantIdx];
  }

  // Get background (region-specific)
  const bgIdx = Math.floor(Math.random() * 5);
  const background = REGION_BACKGROUNDS[region][bgIdx];

  // Get mood, photo style
  const mood = REGION_MOOD[region];
  const photoStyle = ERA_PHOTO_STYLE[era];

  // Pick framing
  const framing = pickFraming();
  const framingText = FRAMING_TEXT[framing];

  // Wide + medium keep full outfit; tighter shots strip lower-body items
  const finalClothes = (framing === "wide" || framing === "medium") ? clothes : stripLowerBody(clothes);

  // Assemble
  const prompt = [
    `Take this exact person and place them into a hip hop album cover photograph.`,
    `Change their clothes to ${finalClothes}.`,
    `Place them ${background}.`,
    `${mood}.`,
    `${photoStyle}.`,
    `${framingText}`,
    `${REALISM}.`,
    `No text or typography anywhere in the image.`,
    `Keep their likeness perfectly intact. Square 1:1 format.`,
  ].join(" ");

  console.log(
    `[prompt] era=${era} region=${region} variant=${variantIdx + 1} bg=${bgIdx + 1} framing=${framing}`
  );

  return prompt;
}
