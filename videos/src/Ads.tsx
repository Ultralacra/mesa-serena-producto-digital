import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  BOSQUE,
  BOSQUE_OSCURO,
  CREMA,
  ORO,
  PAPEL,
  SAGE,
  SANS,
  SERIF,
  SERIF_IT,
  TERRA,
} from "./fonts";

/* Piezas 1080×1350 para Meta Ads. Sistema: foto editorial + serif + sello de precio. */

/* Marca oficial: 00-perfil-instagram.png tal cual.
   Bosque + aro de oro + M crema serif + línea terracota debajo.
   No recrear la M con tipografía: siempre usar el archivo real. */
function LogoMark({ size = 76 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: 999,
        overflow: "hidden",
        border: `3px solid ${ORO}`,
        boxShadow: "0 10px 26px rgba(18,38,31,0.35)",
        backgroundColor: BOSQUE,
      }}
    >
      <Img
        src={staticFile("img/logo-perfil.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

function BrandBar({
  light = false,
  pill = false,
  size = 76,
}: {
  light?: boolean;
  pill?: boolean;
  size?: number;
}) {
  const textColor = pill ? BOSQUE : light ? CREMA : BOSQUE;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        ...(pill
          ? {
              backgroundColor: CREMA,
              borderRadius: 999,
              padding: "10px 30px 10px 10px",
              boxShadow: "0 16px 34px rgba(18,38,31,0.32)",
              border: `2px solid ${ORO}`,
            }
          : {}),
      }}
    >
      <LogoMark size={size} />
      <div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: 5,
            lineHeight: 1,
            color: textColor,
            whiteSpace: "nowrap",
          }}
        >
          MESA SERENA
        </div>
        {/* Línea terracota: el mismo gesto que subraya la M del logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
          <div
            style={{ width: 52, height: 8, borderRadius: 999, backgroundColor: TERRA, flex: "none" }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: 3,
              color: pill ? TERRA : ORO,
              whiteSpace: "nowrap",
            }}
          >
            RECETARIO CRIOLLO
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandFooter({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <LogoMark size={42} />
      <div
        style={{
          fontFamily: SANS,
          fontSize: 21,
          fontWeight: 800,
          letterSpacing: 4,
          color: dark ? ORO : BOSQUE,
          whiteSpace: "nowrap",
        }}
      >
        MESA SERENA · COME CRIOLLO
      </div>
    </div>
  );
}

function PriceSeal({ size = 190 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: TERRA,
        color: PAPEL,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        rotate: "-7deg",
        boxShadow: "0 18px 38px rgba(18,38,31,0.35)",
        border: `3px dashed rgba(255,251,244,0.55)`,
        outline: `6px solid ${TERRA}`,
      }}
    >
      <div style={{ fontFamily: SERIF, fontSize: size * 0.34, lineHeight: 1 }}>5</div>
      <div style={{ fontFamily: SANS, fontSize: size * 0.15, fontWeight: 800, letterSpacing: 3 }}>USD</div>
    </div>
  );
}

function CtaRow({ dark = false }: { dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <div
        style={{
          backgroundColor: TERRA,
          color: PAPEL,
          fontFamily: SANS,
          fontSize: 28,
          fontWeight: 800,
          padding: "18px 28px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          flex: "none",
        }}
      >
        Quiero mi recetario →
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontSize: 23,
          lineHeight: 1.35,
          color: dark ? "#C9D1CB" : "#5C635D",
        }}
      >
        Pagas en bolívares
        <br />a tasa BCV
      </div>
    </div>
  );
}

function Kicker({ children, color = TERRA }: { children: string; color?: string }) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: 5,
        color,
      }}
    >
      {children}
    </div>
  );
}

/* ── 01 · Arepa ─────────────────────────────────────── */
export const Ad01Arepa = () => (
  <AbsoluteFill style={{ backgroundColor: CREMA }}>
    <div style={{ height: 760, position: "relative", overflow: "hidden" }}>
      <Img src={staticFile("img/arepa.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(18,38,31,0.42) 0%, rgba(18,38,31,0) 40%)" }}
      />
      <div style={{ position: "absolute", top: 46, left: 56 }}>
        <BrandBar light />
      </div>
      <div style={{ position: "absolute", right: 48, bottom: -14 }}>
        <PriceSeal />
      </div>
    </div>
    <div style={{ padding: "52px 64px 0" }}>
      <Kicker>RECETARIO CRIOLLO PARA DIABETES</Kicker>
      <div style={{ fontFamily: SERIF, fontSize: 76, lineHeight: 1.04, color: BOSQUE, marginTop: 20 }}>
        Te dijeron que se acabó la arepa.{" "}
        <span style={{ fontFamily: SERIF_IT, color: TERRA }}>Te mintieron a medias.</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 40,
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 27, color: "#3E4A42", lineHeight: 1.4 }}>
          50 recetas criollas.
          <br />
          El recetario llega a tu correo.
        </div>
        <CtaRow />
      </div>
    </div>
  </AbsoluteFill>
);

/* ── 02 · Mercado ───────────────────────────────────── */
export const Ad02Mercado = () => (
  <AbsoluteFill style={{ backgroundColor: CREMA, padding: "56px 64px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <BrandBar />
      <Kicker>PARA TODOS LOS BOLSILLOS</Kicker>
    </div>
    <div style={{ fontFamily: SERIF, fontSize: 80, lineHeight: 1.03, color: BOSQUE, marginTop: 44 }}>
      Esto no es un recetario <span style={{ fontFamily: SERIF_IT, color: TERRA }}>de Miami.</span>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 29, color: "#3E4A42", marginTop: 20 }}>
      Es de tu mercado: huevo, pollo, caraota, auyama.
    </div>
    <div style={{ marginTop: 36, borderRadius: 30, overflow: "hidden", height: 480, position: "relative" }}>
      <Img src={staticFile("img/mercado.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", right: 28, top: 24 }}>
        <PriceSeal size={168} />
      </div>
    </div>
    <div style={{ display: "flex", gap: 14, marginTop: 34 }}>
      {[
        ["30", "DIARIO"],
        ["14", "CÓMODO"],
        ["6", "DOMINGO"],
      ].map(([num, label], i) => (
        <div
          key={label}
          style={{
            flex: 1,
            textAlign: "center",
            backgroundColor: i === 0 ? BOSQUE : PAPEL,
            color: i === 0 ? CREMA : BOSQUE,
            border: i === 0 ? "none" : `2px solid ${ORO}`,
            borderRadius: 20,
            padding: "20px 0 16px",
          }}
        >
          <div style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 1, color: i === 0 ? ORO : TERRA }}>{num}</div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, letterSpacing: 3, marginTop: 6 }}>{label}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 36 }}>
      <CtaRow />
    </div>
    <div
      style={{
        marginTop: "auto",
        paddingTop: 24,
        borderTop: `2px solid ${ORO}`,
        textAlign: "center",
        fontFamily: SANS,
        fontSize: 24,
        color: "#5C635D",
      }}
    >
      <BrandFooter />
      <div style={{ marginTop: 14 }}>Tu recetario llega directo a tu correo</div>
    </div>
  </AbsoluteFill>
);

/* ── 03 · Familia ───────────────────────────────────── */
export const Ad03Familia = () => (
  <AbsoluteFill style={{ backgroundColor: BOSQUE_OSCURO }}>
    <div style={{ height: 720, position: "relative", overflow: "hidden" }}>
      <Img
        src={staticFile("img/ebook.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(18,38,31,0.45) 0%, rgba(18,38,31,0) 42%)" }}
      />
      <div style={{ position: "absolute", top: 40, left: 48 }}>
        <BrandBar pill />
      </div>
    </div>
    <div style={{ padding: "50px 64px 0", position: "relative" }}>
      <div style={{ position: "absolute", right: 56, top: -96 }}>
        <PriceSeal />
      </div>
      <Kicker color={ORO}>UN SOLO CALDERO</Kicker>
      <div style={{ fontFamily: SERIF, fontSize: 78, lineHeight: 1.04, color: CREMA, marginTop: 20 }}>
        Un solo menú. <span style={{ fontFamily: SERIF_IT, color: ORO }}>Toda la casa come.</span>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 29, color: "#C9D1CB", marginTop: 22, lineHeight: 1.45 }}>
        Ellos, rico. Tú, tu porción. Sin cocinar dos veces
        y sin plato de enferma.
      </div>
      <div style={{ marginTop: 38 }}>
        <CtaRow dark />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 42 }}>
        {["AREPA", "PABELLÓN", "POLLO", "POSTRE SIN PAPELÓN"].map((chip) => (
          <div
            key={chip}
            style={{
              fontFamily: SANS,
              fontSize: 21,
              fontWeight: 800,
              letterSpacing: 2,
              color: ORO,
              border: "2px solid rgba(196,164,106,0.55)",
              borderRadius: 999,
              padding: "12px 20px",
              whiteSpace: "nowrap",
            }}
          >
            {chip}
          </div>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

/* ── 04 · Producto ──────────────────────────────────── */
export const Ad04Producto = () => (
  <AbsoluteFill style={{ backgroundColor: BOSQUE, padding: "60px 64px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <BrandBar light size={88} />
      <Kicker color={ORO}>EDICIÓN DIGITAL</Kicker>
    </div>
    <div style={{ display: "flex", gap: 44, marginTop: 52, alignItems: "center" }}>
      <Img
        src={staticFile("img/ebook-cover.jpg")}
        style={{
          width: 400,
          borderRadius: 16,
          rotate: "-2deg",
          boxShadow: "0 34px 64px rgba(0,0,0,0.4)",
        }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SERIF, fontSize: 68, lineHeight: 1.05, color: CREMA }}>
          El menú de la semana, <span style={{ fontFamily: SERIF_IT, color: ORO }}>resuelto.</span>
        </div>
        <div style={{ display: "grid", gap: 18, marginTop: 34 }}>
          {["50 recetas criollas", "3 menús de 7 días", "Lista de mercado", "+ 6 guías de regalo"].map((item) => (
            <div key={item} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  flex: "none",
                  borderRadius: 999,
                  backgroundColor: TERRA,
                  color: PAPEL,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: SANS,
                  fontSize: 21,
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <span style={{ fontFamily: SANS, fontSize: 29, fontWeight: 600, color: "#E7DFCE" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div
      style={{
        marginTop: 58,
        backgroundColor: CREMA,
        borderRadius: 26,
        padding: "34px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontFamily: SERIF, fontSize: 74, lineHeight: 1, color: TERRA }}>5 USD</div>
        <div style={{ fontFamily: SANS, fontSize: 23, color: "#5C635D", marginTop: 8 }}>
          A tasa BCV · pagas en bolívares
        </div>
      </div>
      <div
        style={{
          backgroundColor: BOSQUE,
          color: CREMA,
          fontFamily: SANS,
          fontSize: 29,
          fontWeight: 800,
          padding: "20px 32px",
          borderRadius: 999,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        Quiero mi
        <br />
        recetario →
      </div>
    </div>
    <div style={{ fontFamily: SANS, fontSize: 23, color: "#9DB4A6", marginTop: 26, textAlign: "center" }}>
      Tu recetario llega directo a tu correo · Recetario educativo, no sustituye a tu médico
    </div>
    <div
      style={{
        marginTop: "auto",
        paddingTop: 26,
        borderTop: "2px solid rgba(196,164,106,0.4)",
      }}
    >
      <BrandFooter dark />
    </div>
  </AbsoluteFill>
);

/* ── 05 · Semáforo ──────────────────────────────────── */
export const Ad05Semaforo = () => (
  <AbsoluteFill style={{ backgroundColor: CREMA }}>
    <div style={{ display: "flex", height: 560 }}>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Img src={staticFile("img/arepa.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Img src={staticFile("img/mercado.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", top: 40, left: 56 }}>
        <BrandBar pill />
      </div>
      <div style={{ position: "absolute", right: 44, top: 392 }}>
        <PriceSeal size={176} />
      </div>
    </div>
    <div style={{ padding: "48px 64px 0" }}>
      <div style={{ fontFamily: SERIF, fontSize: 76, lineHeight: 1.04, color: BOSQUE }}>
        Come criollo. <span style={{ fontFamily: SERIF_IT, color: TERRA }}>Sin pico.</span> Sin comprar
        como rico.
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 38 }}>
        {[
          [SAGE, "SÍ", "Arepa pequeña, pollo, caraotas"],
          [ORO, "A VECES", "Yuca, plátano verde, queso"],
          [TERRA, "CASI NUNCA", "Jugo, papelón, café con azúcar"],
        ].map(([dot, label, text]) => (
          <div
            key={label}
            style={{
              flex: 1,
              backgroundColor: PAPEL,
              border: `2px solid ${ORO}`,
              borderRadius: 20,
              padding: "22px 20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: dot }} />
              <span style={{ fontFamily: SANS, fontSize: 21, fontWeight: 800, letterSpacing: 2, color: BOSQUE }}>{label}</span>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 22, lineHeight: 1.4, color: "#3E4A42", marginTop: 12 }}>{text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 }}>
        <div style={{ fontFamily: SANS, fontSize: 26, color: "#3E4A42", lineHeight: 1.4 }}>
          El semáforo venezolano,
          <br />
          dentro del recetario.
        </div>
        <CtaRow />
      </div>
      <div
        style={{
          marginTop: 46,
          paddingTop: 24,
          borderTop: `2px solid ${ORO}`,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 22,
          color: "#7A7F78",
        }}
      >
        Recetario educativo. No sustituye a tu médico.
      </div>
    </div>
  </AbsoluteFill>
);
