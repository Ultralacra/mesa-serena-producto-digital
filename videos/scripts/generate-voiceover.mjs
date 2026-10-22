import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
}

const apiKey = process.env.ELEVENLABS_API_KEY;
const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const voiceId = process.env.ELEVENLABS_VOICE_ID;
if (!apiKey || !voiceId) {
  throw new Error("Faltan ELEVENLABS_API_KEY o ELEVENLABS_VOICE_ID en videos/.env.local");
}

const lines = [
  "¿Con diabetes se acabó la arepa?",
  "¡Te mintieron a medias! Se acabó la gigante, con jugo y café con azúcar.",
  "Cincuenta recetas criollas, con lo de tu mercado.",
  "Tres menús de siete días, lista de mercado y seis guías.",
  "Cinco dólares, a tasa BCV. Tu recetario, directo a tu correo.",
];

const outDir = join(root, "public", "audio");
mkdirSync(outDir, { recursive: true });

for (let i = 0; i < lines.length; i += 1) {
  const file = join(outDir, `voz-0${i + 1}.mp3`);
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: lines[i],
      model_id: modelId,
      voice_settings: {
        stability: 0.42,
        similarity_boost: 0.82,
        style: 0.38,
        speed: 1.18,
        use_speaker_boost: true,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs respondió ${response.status}: ${await response.text()}`);
  }
  writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  console.log(`voz-0${i + 1}.mp3 listo`);
}
