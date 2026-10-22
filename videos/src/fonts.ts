import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/Manrope";

const serifNormal = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
const serifItalic = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });

export const SERIF = serifNormal.fontFamily;
export const SERIF_IT = serifItalic.fontFamily;
export const SANS = sans.fontFamily;

export const BOSQUE = "#1B3A2F";
export const BOSQUE_OSCURO = "#12261F";
export const CREMA = "#F6F0E4";
export const PAPEL = "#FFFBF4";
export const TERRA = "#C45C3A";
export const ORO = "#C4A46A";
export const SAGE = "#5C7A6A";
