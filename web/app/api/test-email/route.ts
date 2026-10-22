import { NextResponse } from "next/server";
import { recetarioAttachment, sendMail } from "@/lib/mail";
import { receiptEmail } from "@/lib/receipt-email";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "No disponible." }, { status: 404 });
  }

  let to = process.env.MAIL_TEST_TO?.trim() || "";
  try {
    const body = (await request.json()) as { to?: string };
    if (body.to?.trim()) to = body.to.trim();
  } catch {
    // sin cuerpo: usa MAIL_TEST_TO
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { message: "Indica un correo válido en MAIL_TEST_TO o en el cuerpo." },
      { status: 400 },
    );
  }

  try {
    const letter = receiptEmail("César");
    await sendMail({
      to,
      subject: letter.subject,
      text: letter.text,
      html: letter.html,
      attachments: recetarioAttachment(),
    });
    return NextResponse.json({ ok: true, to });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "No se pudo enviar el correo.",
      },
      { status: 502 },
    );
  }
}
