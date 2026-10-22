import { readFileSync } from "fs";
import { createTransport } from "nodemailer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
}

const to = [
  env.MAIL_TEST_TO || "cesaramuroc@gmail.com",
  "valinkgroup@gmail.com",
].filter((email, index, list) => list.indexOf(email) === index);

const transport = createTransport({
  host: env.SMTP2GO_HOST || "mail.smtp2go.com",
  port: Number(env.SMTP2GO_PORT || 2525),
  secure: false,
  requireTLS: true,
  auth: {
    user: env.SMTP2GO_USERNAME,
    pass: env.SMTP2GO_PASSWORD,
  },
  tls: { minVersion: "TLSv1.2" },
});

await transport.verify();
console.log("SMTP_OK");

const stamp = new Date().toLocaleString("es-VE", { timeZone: "America/Caracas" });
const info = await transport.sendMail({
  from: `"${env.MAIL_FROM_NAME || "Mesa Serena"}" <${env.MAIL_FROM || "no-responder@valinkgroup.com"}>`,
  to,
  subject: `PRUEBA Mesa Serena ${stamp}`,
  text: [
    "Hola César,",
    "",
    "Correo simple de prueba, sin adjunto.",
    `Hora local: ${stamp}`,
    "",
    "Si ves este mensaje, SMTP2GO sí está entregando. Revisa también Spam y Promociones.",
    "",
    "Mesa Serena",
  ].join("\n"),
  html: `<p>Hola César,</p><p>Correo <strong>simple</strong> de prueba, sin adjunto.</p><p>Hora local: ${stamp}</p><p>Revisa también Spam y Promociones.</p>`,
});

console.log("SENT");
console.log("to", to.join(","));
console.log("messageId", info.messageId || "");
console.log("accepted", (info.accepted || []).join(",") || "(none)");
console.log("rejected", (info.rejected || []).join(",") || "(none)");
console.log("pending", (info.pending || []).join(",") || "(none)");
console.log("response", info.response || "");
