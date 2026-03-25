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

export const ERA_FUN_FACTS: Record<Era, string[]> = {
  "70s": [
    "DJ Kool Herc threw the first hip hop party on August 11, 1973 at 1520 Sedgwick Ave in the Bronx.",
    "The earliest MCs didn't rap verses — they hyped the crowd between the DJ's breaks.",
    "Graffiti writers like TAKI 183 and CORNBREAD pioneered the visual language of hip hop before the music even had a name.",
    "B-boys and b-girls battled on cardboard in parks — breakdancing was the original competitive art form of hip hop.",
    "The Bronx was burning — literally. Landlords torched buildings for insurance money while kids invented a culture in the rubble.",
    "Grandmaster Flash invented the Quick Mix Theory — cutting between two copies of the same record to extend the break.",
    "Hip hop's four pillars — DJing, MCing, breaking, and graffiti — were all born within a few miles of each other.",
    "Afrika Bambaataa's Universal Zulu Nation turned hip hop into a peace movement, channeling gang energy into art.",
    "The first hip hop crews were block-based — your neighborhood was your identity and your crew was your family.",
    "Before turntablism, DJs were playing entire records. Isolating the break was a Bronx invention that changed music forever.",
  ],
  "80s": [
    "Run-DMC's deal with Adidas in 1986 was the first sneaker endorsement in hip hop — they rocked shell-toes with no laces.",
    "The Beastie Boys' Licensed to Ill (1986) was the first hip hop album to hit #1 on the Billboard 200.",
    "Salt-N-Pepa's 'Push It' broke hip hop into pop radio and proved women could dominate the genre from day one.",
    "Doug E. Fresh could beatbox an entire drum kit with his mouth — no machines, just lips, teeth, and lungs.",
    "LL Cool J recorded 'I Need a Beat' in his grandmother's basement in Queens when he was 16 years old.",
    "The Roland TR-808 drum machine became hip hop's signature sound — that deep bass kick defined an entire decade.",
    "Slick Rick's storytelling on 'Children's Story' set the blueprint for narrative rap for the next 40 years.",
    "Def Jam Records started in a NYU dorm room with Rick Rubin and Russell Simmons and $5,000.",
    "The Kangol bucket hat became hip hop's crown — LL Cool J made it iconic by never taking it off.",
    "Rakim's flow on 'Paid in Full' introduced internal rhyme schemes that MCs are still studying today.",
  ],
  "90s": [
    "Nas wrote Illmatic when he was 20 years old — it's still considered one of the greatest albums ever made.",
    "Wu-Tang Clan had nine members sign solo deals with different labels while staying together as a group — unprecedented business.",
    "Tupac recorded 'All Eyez on Me' — a double album — in just two weeks after posting bail from prison.",
    "The Notorious B.I.G. freestyled 'Juicy' in one take — the rags-to-riches anthem that defined 90s hip hop.",
    "Lauryn Hill's 'The Miseducation of Lauryn Hill' won five Grammys — the most ever for a hip hop artist at that time.",
    "DJ Premier chopped soul samples into gritty loops that became the signature sound of New York in the 90s.",
    "OutKast's 'ATLiens' proved Southern hip hop could be experimental, weird, and critically acclaimed all at once.",
    "The Source magazine's Five Mic rating was the highest honor in hip hop — only a handful of albums ever earned it.",
    "Biggie and Tupac's rivalry dominated headlines, but behind the scenes both coasts were collaborating more than fighting.",
    "A Tribe Called Quest fused jazz samples with conscious lyrics and proved hip hop could be intellectual without losing its edge.",
  ],
  "00s": [
    "Kanye West produced 'Through the Wire' with his jaw wired shut after a car accident — then rapped the verse the same way.",
    "50 Cent's 'Get Rich or Die Tryin' sold 872,000 copies in its first four days — the biggest debut of the decade.",
    "Missy Elliott's music videos were so innovative they changed what MTV even thought was possible.",
    "Lil Wayne recorded thousands of songs and released mixtapes so frequently he was called the hardest working man in hip hop.",
    "Jay-Z retired after 'The Black Album' in 2003… then un-retired because he couldn't stay away.",
    "Pharrell and The Neptunes produced hits for everyone from Clipse to Britney Spears — they owned the radio.",
    "Eminem's 'The Marshall Mathers LP' sold 1.76 million copies in its first week — still one of the fastest-selling albums ever.",
    "Dipset made pink the hardest color in hip hop — Cam'ron wore a pink fur coat and nobody questioned it.",
    "T.I. declared himself the King of the South and then backed it up with 'Trap Muzik' and 'King.'",
    "Nelly's 'Hot in Herre' had the whole planet taking off their clothes — it hit #1 in six countries.",
  ],
  "10s": [
    "Drake started as a child actor on Degrassi before becoming the most streamed artist in Spotify history.",
    "Kendrick Lamar's 'DAMN.' won the Pulitzer Prize for Music in 2018 — the first non-jazz or classical album to win.",
    "SoundCloud created a new generation of rappers who bypassed labels entirely and went straight to millions of fans.",
    "Travis Scott turned concerts into immersive experiences — his Astroworld tour had an actual roller coaster.",
    "Cardi B's 'Bodak Yellow' made her the first solo female rapper to hit #1 since Lauryn Hill in 1998.",
    "Chance the Rapper won three Grammys without ever signing a record deal or selling a physical album.",
    "Migos' triplet flow became so influential that every rapper on the planet started using it.",
    "Tyler, the Creator went from banned-in-countries provocateur to Grammy-winning artist with 'IGOR.'",
    "Nipsey Hussle turned his Marathon Clothing store into a tech-forward community hub in Crenshaw before his passing.",
    "J. Cole went double platinum with no features on '2014 Forest Hills Drive' — proving substance still sells.",
  ],
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
