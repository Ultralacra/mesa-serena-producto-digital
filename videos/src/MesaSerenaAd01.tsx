import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/Manrope";

const serifNormal = loadSerif("normal", { weights: ["400"], subsets: ["latin"] });
const serifItalic = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
const sans = loadSans("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });

const SERIF = serifNormal.fontFamily;
const SERIF_IT = serifItalic.fontFamily;
const SANS = sans.fontFamily;

const BOSQUE = "#1B3A2F";
const BOSQUE_OSCURO = "#12261F";
const CREMA = "#F6F0E4";
const PAPEL = "#FFFBF4";
const TERRA = "#C45C3A";
const ORO = "#C4A46A";

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type AdProps = {
  priceText: string;
  ctaText: string;
  deliveryText: string;
};

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 8,
        color: dark ? BOSQUE : ORO,
      }}
    >
      MESA SERENA
    </div>
  );
}

function Progress() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scenes = [108, 276, 378, 522, 690];
  return (
    <div
      style={{
        position: "absolute",
        top: 42,
        left: 90,
        right: 90,
        display: "flex",
        gap: 10,
        zIndex: 30,
      }}
    >
      {scenes.map((end, i) => {
        const start = i === 0 ? 0 : scenes[i - 1];
        const fill = interpolate(frame, [start, end], [0, 1], CLAMP);
        return (
          <div
            key={end}
            style={{
              flex: 1,
              height: 7,
              borderRadius: 4,
              backgroundColor: "rgba(246,240,228,0.35)",
              overflow: "hidden",
            }}
          >
            <div style={{ width: `${fill * 100}%`, height: "100%", backgroundColor: TERRA }} />
          </div>
        );
      })}
      <span style={{ display: "none" }}>{durationInFrames}</span>
    </div>
  );
}

function Words({
  text,
  start,
  step = 4,
  style,
  italicWords = [],
}: {
  text: string;
  start: number;
  step?: number;
  style?: React.CSSProperties;
  italicWords?: string[];
}) {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {text.split(" ").map((word, i) => {
        const at = start + i * step;
        const clean = word.replace(/[¿?¡!.,]/g, "").toLowerCase();
        return (
          <span
            key={`${word}-${i}`}
            style={{
              display: "inline-block",
              marginRight: "0.24em",
              fontFamily: italicWords.includes(clean) ? SERIF_IT : undefined,
              opacity: interpolate(frame, [at, at + 7], [0, 1], { ...CLAMP, easing: easeOut }),
              translate: interpolate(frame, [at, at + 7], ["0px 34px", "0px 0px"], {
                ...CLAMP,
                easing: easeOut,
              }),
              scale: interpolate(frame, [at, at + 7], [0.86, 1], {
                ...CLAMP,
                easing: easeOut,
                output: "perceptual-scale",
              }),
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}

function Voice({ file, delay = 5 }: { file: string; delay?: number }) {
  return (
    <Sequence from={delay}>
      <Audio src={staticFile(file)} volume={1} />
    </Sequence>
  );
}

/* ── Escena 1 · 0–3,5 s ─────────────────────────────── */
function SceneHook() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: BOSQUE_OSCURO }}>
      <Voice file="audio/voz-01.mp3" delay={4} />
      <Img
        src={staticFile("img/arepa.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, 22, 26, 48, 52, 74, 78, 105], [1.06, 1.14, 1.14, 1.22, 1.22, 1.3, 1.3, 1.38], {
            ...CLAMP,
            output: "perceptual-scale",
          }),
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(18,38,31,0.5) 0%, rgba(18,38,31,0) 32%, rgba(18,38,31,0.9) 76%)",
        }}
      />
      <div style={{ position: "absolute", top: 88, left: 90 }}>
        <Brand />
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, bottom: 330 }}>
        <div style={{ fontFamily: SERIF, fontSize: 122, lineHeight: 1.02, color: CREMA }}>
          <Words text="¿Diabetes =" start={6} />
          <br />
          <span style={{ color: ORO }}>
            <Words text="¿sin arepa?" start={20} italicWords={["sin", "arepa"]} />
          </span>
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: TERRA,
            marginTop: 30,
            width: interpolate(frame, [30, 52], ["0%", "62%"], CLAMP),
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 90,
          bottom: 236,
          fontFamily: SANS,
          fontSize: 34,
          fontWeight: 600,
          color: "#E7DFCE",
          opacity: interpolate(frame, [44, 58], [0, 1], CLAMP),
        }}
      >
        Mira esto antes de resignarte ↓
      </div>
    </AbsoluteFill>
  );
}

/* ── Escena 2 · 3,5–10,7 s ──────────────────────────── */
function StrikeItem({ label, at }: { label: string; at: number }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 44,
        fontWeight: 600,
        color: "#3E4A42",
        opacity: interpolate(frame, [at, at + 8], [0, 1], { ...CLAMP, easing: easeOut }),
        translate: interpolate(frame, [at, at + 8], ["30px 0px", "0px 0px"], {
          ...CLAMP,
          easing: easeOut,
        }),
      }}
    >
      <span style={{ position: "relative", display: "inline-block" }}>
        {label}
        <span
          style={{
            position: "absolute",
            left: -4,
            top: "54%",
            height: 7,
            borderRadius: 4,
            backgroundColor: TERRA,
            width: interpolate(frame, [at + 12, at + 24], ["0%", "102%"], {
              ...CLAMP,
              easing: easeOut,
            }),
            opacity: interpolate(frame, [at + 12, at + 16], [0, 1], CLAMP),
          }}
        />
      </span>
    </div>
  );
}

function SceneTruth() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: CREMA }}>
      <Voice file="audio/voz-02.mp3" />
      <div style={{ height: 880, overflow: "hidden" }}>
        <Img
          src={staticFile("img/arepa.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: interpolate(frame, [0, 40, 44, 90, 94, 150, 154, 216], [1.22, 1.13, 1.13, 1.2, 1.2, 1.1, 1.1, 1.18], {
              ...CLAMP,
              output: "perceptual-scale",
            }),
          }}
        />
      </div>
      <div style={{ padding: "62px 90px" }}>
        <div style={{ fontFamily: SERIF, fontSize: 92, lineHeight: 1.04, color: BOSQUE }}>
          <Words text="Te mintieron" start={4} />
          <br />
          <span style={{ color: TERRA }}>
            <Words text="a medias." start={14} italicWords={["medias"]} />
          </span>
        </div>
        <div style={{ display: "grid", gap: 24, marginTop: 46 }}>
          <StrikeItem label="✕  Arepa tamaño plato" at={58} />
          <StrikeItem label="✕  Jugo “natural”" at={86} />
          <StrikeItem label="✕  Café con azúcar" at={114} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Escena 3 · 10,7–15,1 s ─────────────────────────── */
function SceneBook() {
  const frame = useCurrentFrame();
  const dishes = ["AREPA", "PABELLÓN", "POLLO", "AUYAMA", "CARAOTAS"];
  const dish = dishes[Math.min(dishes.length - 1, Math.floor(frame / 22))];
  const dishFrame = frame % 22;
  const count = Math.round(interpolate(frame, [8, 44], [0, 50], { ...CLAMP, easing: easeOut }));
  return (
    <AbsoluteFill style={{ backgroundColor: BOSQUE }}>
      <Voice file="audio/voz-03.mp3" />
      <div style={{ height: 820, overflow: "hidden" }}>
        <Img
          src={staticFile("img/mercado.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            scale: interpolate(frame, [0, 34, 38, 80, 84, 132], [1.08, 1.18, 1.18, 1.1, 1.1, 1.2], {
              ...CLAMP,
              output: "perceptual-scale",
            }),
          }}
        />
      </div>
      <div style={{ padding: "58px 90px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <span
            style={{
              fontFamily: SERIF,
              fontSize: 168,
              lineHeight: 0.95,
              color: TERRA,
              scale: interpolate(frame, [44, 56], [1, 1.06], { ...CLAMP, output: "perceptual-scale" }),
            }}
          >
            {count}
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 76, lineHeight: 1.02, color: CREMA }}>
            recetas
            <br />
            <span style={{ fontFamily: SERIF_IT, color: ORO }}>criollas</span>
          </span>
        </div>
        <div
          style={{
            marginTop: 42,
            display: "inline-block",
            backgroundColor: TERRA,
            color: PAPEL,
            fontFamily: SANS,
            fontSize: 46,
            fontWeight: 800,
            letterSpacing: 3,
            padding: "18px 34px",
            borderRadius: 16,
            opacity: interpolate(dishFrame, [0, 5], [0, 1], CLAMP),
            translate: interpolate(dishFrame, [0, 5], ["0px 18px", "0px 0px"], CLAMP),
          }}
        >
          {dish}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 38, color: "#C9D1CB", marginTop: 36 }}>
          Con lo de tu mercado. Sin comprar como rico.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 48 }}>
          {["30 DIARIO", "14 CÓMODO", "6 DOMINGO"].map((chip, i) => (
            <div
              key={chip}
              style={{
                fontFamily: SANS,
                fontSize: 31,
                fontWeight: 800,
                letterSpacing: 2,
                color: i === 0 ? BOSQUE : CREMA,
                backgroundColor: i === 0 ? ORO : "rgba(246,240,228,0.1)",
                border: i === 0 ? "none" : "2px solid rgba(196,164,106,0.5)",
                borderRadius: 999,
                padding: "15px 26px",
                opacity: interpolate(frame, [46 + i * 9, 58 + i * 9], [0, 1], {
                  ...CLAMP,
                  easing: easeOut,
                }),
                translate: interpolate(frame, [46 + i * 9, 58 + i * 9], ["0px 26px", "0px 0px"], {
                  ...CLAMP,
                  easing: easeOut,
                }),
              }}
            >
              {chip}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Escena 4 · 15,1–21,1 s ─────────────────────────── */
function SceneProduct() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 15, stiffness: 130 } });
  const cards = [
    ["3 menús de 7 días", "Uno por bolsillo: diario, cómodo y domingo"],
    ["Lista de mercado", "Para que el real rinda toda la semana"],
    ["+ 6 guías", "Arepa sin pico, semáforo, sustituciones y más"],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: BOSQUE_OSCURO, padding: "170px 90px 0" }}>
      <Voice file="audio/voz-04.mp3" />
      <div style={{ display: "flex", gap: 48, alignItems: "center" }}>
        <Img
          src={staticFile("img/ebook-cover.jpg")}
          style={{
            width: 360,
            borderRadius: 18,
            boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
            scale: interpolate(pop, [0, 1], [0.8, 1], { ...CLAMP, output: "perceptual-scale" }),
            rotate: interpolate(frame, [0, 90, 180], ["-3deg", "-1deg", "-2deg"], CLAMP),
            translate: interpolate(frame, [0, 90, 180], ["0px 0px", "0px -16px", "0px 0px"], CLAMP),
          }}
        />
        <div>
          <div style={{ fontFamily: SANS, fontSize: 27, fontWeight: 800, letterSpacing: 6, color: ORO }}>
            TODO EN UN SOLO LIBRO
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 72, lineHeight: 1.06, color: CREMA, marginTop: 20 }}>
            El menú de <span style={{ fontFamily: SERIF_IT, color: ORO }}>la semana,</span> resuelto.
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 22, marginTop: 66 }}>
        {cards.map(([title, text], i) => {
          const at = 26 + i * 22;
          return (
            <div
              key={title}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "center",
                backgroundColor: "rgba(246,240,228,0.07)",
                border: "2px solid rgba(196,164,106,0.4)",
                borderRadius: 22,
                padding: "28px 32px",
                opacity: interpolate(frame, [at, at + 10], [0, 1], { ...CLAMP, easing: easeOut }),
                translate: interpolate(frame, [at, at + 10], ["70px 0px", "0px 0px"], {
                  ...CLAMP,
                  easing: easeOut,
                }),
              }}
            >
              <span
                style={{
                  flex: "none",
                  width: 54,
                  height: 54,
                  borderRadius: 999,
                  backgroundColor: TERRA,
                  color: PAPEL,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: SANS,
                  fontSize: 30,
                  fontWeight: 800,
                  scale: interpolate(
                    spring({ frame: frame - (at + 6), fps, config: { damping: 11, stiffness: 200 } }),
                    [0, 1],
                    [0, 1],
                    { ...CLAMP, output: "perceptual-scale" },
                  ),
                }}
              >
                ✓
              </span>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: CREMA }}>{title}</div>
                <div style={{ fontFamily: SANS, fontSize: 33, color: "#C9D1CB", marginTop: 4 }}>{text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/* ── Escena 5 · 21,1–28,1 s ─────────────────────────── */
function SceneCta(props: AdProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 22, fps, config: { damping: 12, stiffness: 170 } });
  const pulse = frame > 60 ? 1 + Math.sin((frame - 60) / 5.5) * 0.022 : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: CREMA, alignItems: "center", padding: "140px 90px 0", textAlign: "center" }}>
      <Voice file="audio/voz-05.mp3" delay={6} />
      <Brand dark />
      <Img
        src={staticFile("img/ebook.jpg")}
        style={{
          width: 400,
          borderRadius: 20,
          marginTop: 52,
          boxShadow: "0 34px 70px rgba(18,38,31,0.28)",
          scale: interpolate(
            spring({ frame, fps, config: { damping: 15, stiffness: 120 } }),
            [0, 1],
            [0.84, 1],
            { ...CLAMP, output: "perceptual-scale" },
          ),
        }}
      />
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 138,
          lineHeight: 1,
          color: TERRA,
          marginTop: 46,
          opacity: interpolate(frame, [16, 30], [0, 1], { ...CLAMP, easing: easeOut }),
          scale: interpolate(frame, [16, 32], [0.9, 1], { ...CLAMP, easing: easeOut, output: "perceptual-scale" }),
        }}
      >
        {props.priceText}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 38, color: "#3E4A42", marginTop: 10 }}>
        a tasa BCV · pagas en bolívares
      </div>
      <div
        style={{
          marginTop: 48,
          backgroundColor: TERRA,
          color: PAPEL,
          fontFamily: SANS,
          fontSize: 47,
          fontWeight: 800,
          padding: "30px 56px",
          borderRadius: 999,
          boxShadow: "0 22px 48px rgba(196,92,58,0.42)",
          scale: interpolate(enter, [0, 1], [0.78, 1], { ...CLAMP, output: "perceptual-scale" }) * pulse,
        }}
      >
        {props.ctaText} →
      </div>
      <div
        style={{
          fontFamily: SERIF_IT,
          fontSize: 52,
          color: BOSQUE,
          marginTop: 46,
          maxWidth: 820,
          lineHeight: 1.25,
          opacity: interpolate(frame, [70, 88], [0, 1], { ...CLAMP, easing: easeOut }),
          translate: interpolate(frame, [70, 88], ["0px 24px", "0px 0px"], { ...CLAMP, easing: easeOut }),
        }}
      >
        {props.deliveryText}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 90,
          right: 90,
          fontFamily: SANS,
          fontSize: 27,
          color: "#7A7F78",
        }}
      >
        Recetario educativo. No sustituye a tu médico.
      </div>
    </AbsoluteFill>
  );
}

export const MesaSerenaAd01 = (props: AdProps) => {
  return (
    <AbsoluteFill style={{ backgroundColor: BOSQUE_OSCURO }}>
      <Sequence name="01 Gancho" from={0} durationInFrames={108}>
        <SceneHook />
      </Sequence>
      <Sequence name="02 Verdad" from={108} durationInFrames={168}>
        <SceneTruth />
      </Sequence>
      <Sequence name="03 Libro" from={276} durationInFrames={102}>
        <SceneBook />
      </Sequence>
      <Sequence name="04 Producto" from={378} durationInFrames={144}>
        <SceneProduct />
      </Sequence>
      <Sequence name="05 Cierre" from={522} durationInFrames={168}>
        <SceneCta {...props} />
      </Sequence>
      <Progress />
    </AbsoluteFill>
  );
};
