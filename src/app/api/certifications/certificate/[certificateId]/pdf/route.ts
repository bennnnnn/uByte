import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { withErrorHandling, requireAuth } from "@/lib/api-utils";
import { getCertificateById, getUserById } from "@/lib/db";
import { LANGUAGES } from "@/lib/languages/registry";
import type { SupportedLanguage } from "@/lib/languages/types";
import { APP_NAME } from "@/lib/constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function center(pageWidth: number, textWidth: number) {
  return (pageWidth - textWidth) / 2;
}

async function buildCertificatePdf(
  name: string,
  lang: string,
  certificateId: string,
  passedAt: string,
) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${name} — ${lang} Certificate`);
  pdf.setSubject(`Certification issued by ${APP_NAME}`);
  pdf.setCreator(APP_NAME);

  const page = pdf.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const indigo = rgb(0.31, 0.27, 0.9);
  const dark = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.45, 0.45, 0.5);

  // Border
  const border = 4;
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: indigo,
    borderWidth: border,
    opacity: 0,
  });

  // Inner decorative line
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: rgb(0.85, 0.85, 0.92),
    borderWidth: 1,
    opacity: 0,
  });

  // Header: APP_NAME
  const appNameSize = 14;
  const appNameW = helveticaBold.widthOfTextAtSize(APP_NAME, appNameSize);
  page.drawText(APP_NAME, {
    x: center(width, appNameW),
    y: height - 80,
    size: appNameSize,
    font: helveticaBold,
    color: indigo,
  });

  // "CERTIFICATE"
  const certLabel = "CERTIFICATE";
  const certSize = 12;
  const certW = helvetica.widthOfTextAtSize(certLabel, certSize);
  page.drawText(certLabel, {
    x: center(width, certW),
    y: height - 110,
    size: certSize,
    font: helvetica,
    color: indigo,
  });

  // Decorative lines around "CERTIFICATE"
  const lineY = height - 105;
  const lineGap = 16;
  const certLeft = center(width, certW);
  const certRight = certLeft + certW;
  page.drawLine({ start: { x: 100, y: lineY }, end: { x: certLeft - lineGap, y: lineY }, thickness: 0.5, color: rgb(0.8, 0.8, 0.88) });
  page.drawLine({ start: { x: certRight + lineGap, y: lineY }, end: { x: width - 100, y: lineY }, thickness: 0.5, color: rgb(0.8, 0.8, 0.88) });

  // "This certifies that"
  const certifiesText = "This certifies that";
  const certifiesSize = 13;
  const certifiesW = helvetica.widthOfTextAtSize(certifiesText, certifiesSize);
  page.drawText(certifiesText, {
    x: center(width, certifiesW),
    y: height - 168,
    size: certifiesSize,
    font: helvetica,
    color: muted,
  });

  // User name
  const nameSize = 32;
  const nameW = helveticaBold.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: center(width, nameW),
    y: height - 218,
    size: nameSize,
    font: helveticaBold,
    color: dark,
  });

  // "has successfully passed the"
  const passedText = "has successfully passed the";
  const passedSize = 13;
  const passedW = helvetica.widthOfTextAtSize(passedText, passedSize);
  page.drawText(passedText, {
    x: center(width, passedW),
    y: height - 268,
    size: passedSize,
    font: helvetica,
    color: muted,
  });

  // Language certification title
  const langConfig = LANGUAGES[lang as SupportedLanguage];
  const langName = langConfig?.name ?? lang;
  const examTitle = `${langName} Certification Exam`;
  const examTitleSize = 22;
  const examTitleW = helveticaBold.widthOfTextAtSize(examTitle, examTitleSize);
  page.drawText(examTitle, {
    x: center(width, examTitleW),
    y: height - 308,
    size: examTitleSize,
    font: helveticaBold,
    color: dark,
  });

  // Proficiency line
  const profText = `demonstrating proficiency in core concepts and problem solving in ${langName}.`;
  const profSize = 11;
  const profW = helvetica.widthOfTextAtSize(profText, profSize);
  page.drawText(profText, {
    x: center(width, profW),
    y: height - 340,
    size: profSize,
    font: helvetica,
    color: muted,
  });

  // Footer: Certificate ID | Issued date
  const footerY = 56;
  const footerSize = 9;
  const idText = `Certificate ID: ${certificateId}`;
  page.drawText(idText, {
    x: 48,
    y: footerY,
    size: footerSize,
    font: helvetica,
    color: muted,
  });

  const dateText = `Issued ${formatDate(passedAt)}`;
  const dateW = helvetica.widthOfTextAtSize(dateText, footerSize);
  page.drawText(dateText, {
    x: width - 48 - dateW,
    y: footerY,
    size: footerSize,
    font: helvetica,
    color: muted,
  });

  return pdf.save();
}

export const GET = withErrorHandling(
  "GET /api/certifications/certificate/[certificateId]/pdf",
  async (_req: Request, context?: unknown) => {
    const { user, response } = await requireAuth();
    if (!user) return response;

    const { certificateId } = (context as { params?: Promise<{ certificateId: string }> }).params
      ? await (context as { params: Promise<{ certificateId: string }> }).params
      : { certificateId: "" };

    const cert = await getCertificateById(certificateId);
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }
    if (cert.user_id !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const owner = await getUserById(user.userId);
    const name = owner?.name ?? "Student";

    const pdfBytes = await buildCertificatePdf(
      name,
      cert.lang,
      cert.id,
      cert.passed_at,
    );

    const filename = `uByte-${cert.lang}-certificate.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
);
