// Shared types and UI-facing data — safe for client and server

export type Era = "70s" | "80s" | "90s" | "00s" | "10s";
export type Region = "east" | "west" | "south" | "midwest" | "international";

export const ERA_DATA: Record<Era, { label: string; description: string }> = {
  "70s": {
    label: "1970s",
    description:
      "From the South Bronx to the world, rep the era that started it all. Block parties, bell bottoms, break dancing, and Hennessy.",
  },
  "80s": {
    label: "1980s",
    description:
      "Boom boxes, shell-toes, and Kangol hats. The golden age where hip hop went from the streets to the mainstream.",
  },
  "90s": {
    label: "1990s",
    description:
      "East vs. West. Biggie and Pac. Timbs and bandanas. The decade hip hop became the dominant force in music.",
  },
  "00s": {
    label: "2000s",
    description:
      "Bling era. Ice on everything. Escalades, Air Force 1s, and Jesus pieces. Hip hop went platinum overnight.",
  },
  "10s": {
    label: "2010s",
    description:
      "SoundCloud to stadium. Face tats, designer everything, and a whole new sound. Hip hop merged with fashion and global culture.",
  },
};

export const REGION_DATA: Record<Region, { label: string; description: string }> = {
  east: {
    label: "EAST",
    description:
      "Concrete jungle where dreams are made. The East Coast gave us the raw, uncut foundation of hip hop.",
  },
  west: {
    label: "WEST",
    description:
      "G Funk. Gangsta Rap. The Hyphy Movement. The coast that brought us some of the greatest to mention Hennessy in their music.",
  },
  south: {
    label: "SOUTH",
    description:
      "Trunk rattling, swangas poking, bass that hits different. The South built its own lane and made the whole world ride with it.",
  },
  midwest: {
    label: "MIDWEST",
    description:
      "Chi-town drill, Detroit grit, Minneapolis funk. The Midwest doesn\u2019t follow trends \u2014 it sets them.",
  },
  international: {
    label: "INTERNATIONAL",
    description:
      "Hip hop has no borders. From Tokyo to London to Paris to Lagos, the culture went global.",
  },
};
