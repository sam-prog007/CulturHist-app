// Import all fact images
import alexanderGreat from "./facts/alexander-great.jpg";
import angkorWat from "./facts/angkor-wat.jpg";
import columbusShips from "./facts/columbus-ships.jpg";
import davinciMonaLisa from "./facts/davinci-mona-lisa.jpg";
import frenchRevolution from "./facts/french-revolution.jpg";
import galileoTelescope from "./facts/galileo-telescope.jpg";
import greatWallChina from "./facts/great-wall-china.jpg";
import greekPhilosophers from "./facts/greek-philosophers.jpg";
import gutenbergPress from "./facts/gutenberg-press.jpg";
import industrialRevolution from "./facts/industrial-revolution.jpg";
import japaneseSamurai from "./facts/japanese-samurai.jpg";
import lutherReformation from "./facts/luther-reformation.jpg";
import machuPicchu from "./facts/machu-picchu.jpg";
import maliKingdom from "./facts/mali-kingdom.jpg";
import marieCurie from "./facts/marie-curie.jpg";
import mayanPyramid from "./facts/mayan-pyramid.jpg";
import medievalKnights from "./facts/medieval-knights.jpg";
import mesopotamiaZiggurat from "./facts/mesopotamia-ziggurat.jpg";
import napoleonBattle from "./facts/napoleon-battle.jpg";
import persianPalace from "./facts/persian-palace.jpg";
import phoenicianShip from "./facts/phoenician-ship.jpg";
import pyramidsEgypt from "./facts/pyramids-egypt.jpg";
import romanColosseum from "./facts/roman-colosseum.jpg";
import vikingLongship from "./facts/viking-longship.jpg";
import wrightBrothers from "./facts/wright-brothers.jpg";

// Map image names to imports for easy lookup
export const factsImages: Record<string, string> = {
  "alexander-great": alexanderGreat,
  "angkor-wat": angkorWat,
  "columbus-ships": columbusShips,
  "davinci-mona-lisa": davinciMonaLisa,
  "french-revolution": frenchRevolution,
  "galileo-telescope": galileoTelescope,
  "great-wall-china": greatWallChina,
  "greek-philosophers": greekPhilosophers,
  "gutenberg-press": gutenbergPress,
  "industrial-revolution": industrialRevolution,
  "japanese-samurai": japaneseSamurai,
  "luther-reformation": lutherReformation,
  "machu-picchu": machuPicchu,
  "mali-kingdom": maliKingdom,
  "marie-curie": marieCurie,
  "mayan-pyramid": mayanPyramid,
  "medieval-knights": medievalKnights,
  "mesopotamia-ziggurat": mesopotamiaZiggurat,
  "napoleon-battle": napoleonBattle,
  "persian-palace": persianPalace,
  "phoenician-ship": phoenicianShip,
  "pyramids-egypt": pyramidsEgypt,
  "roman-colosseum": romanColosseum,
  "viking-longship": vikingLongship,
  "wright-brothers": wrightBrothers
};

// Helper function to get image by key
export const getFactImage = (key: string | null): string | undefined => {
  if (!key) return undefined;
  
  // Extract the filename without path and extension if it's a full path
  // e.g., "/src/assets/facts/pyramids-egypt.jpg" -> "pyramids-egypt"
  const cleanKey = key.includes('/') 
    ? key.split('/').pop()?.replace('.jpg', '').replace('.png', '') || key
    : key;
  
  return factsImages[cleanKey];
};