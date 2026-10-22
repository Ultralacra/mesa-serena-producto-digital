import { existsSync, readFileSync } from "fs";
import { join } from "path";
import nodemailer from "nodemailer";
import { logFlow } from "@/lib/log";

export function mailConfigured() {
  return Boolean(
    process.env.SMTP2GO_USERNAME?.trim() && process.env.SMTP2GO_PASSWORD?.trim(),
  );
}

function transporter() {
  const user = process.env.SMTP2GO_USERNAME?.trim() ?? "";
  const pass = process.env.SMTP2GO_PASSWORD?.trim() ?? "";
  if (!user || !pass) {
    throw new Error("Falta SMTP2GO_USERNAME o SMTP2GO_PASSWORD.");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP2GO_HOST || "mail.smtp2go.com",
    port: Number(process.env.SMTP2GO_PORT || 2525),
    secure: false,
    requireTLS: true,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2" },
  });
}

export function recetarioAttachment() {
  const pdf = join(process.cwd(), "content", "Mesa-Serena-recetario.pdf");
  if (existsSync(pdf)) {
    return [
      {
        filename: "Mesa-Serena-recetario.pdf",
        content: readFileSync(pdf),
        contentType: "application/pdf",
      },
    ];
  }
  const md = join(process.cwd(), "content", "catalogo-50-recetas.md");
  if (!existsSync(md)) return [];
  return [
    {
      filename: "Mesa-Serena-recetario.md",
      content: readFileSync(md),
      contentType: "text/markdown; charset=utf-8",
    },
  ];
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  const fromName = process.env.MAIL_FROM_NAME || "Mesa Serena";
  const fromAddress = process.env.MAIL_FROM || "no-responder@valinkgroup.com";
  logFlow("MAIL · intentando enviar", {
    de: `${fromName} <${fromAddress}>`,
    para: opts.to,
    asunto: opts.subject,
    adjuntos: (opts.attachments ?? []).map((item) => item.filename),
    smtp: `${process.env.SMTP2GO_HOST || "mail.smtp2go.com"}:${process.env.SMTP2GO_PORT || 2525}`,
    usuarioSmtp: process.env.SMTP2GO_USERNAME,
  });

  try {
    const info = await transporter().sendMail({
      from: { name: fromName, address: fromAddress },
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      attachments: opts.attachments,
    });
    logFlow("MAIL · SMTP2GO aceptó el envío", {
      para: opts.to,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      response: info.response,
    });
    return info;
  } catch (error) {
    logFlow("MAIL · FALLÓ el envío", {
      para: opts.to,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
