"use client";

/**
 * Client-only PDF export of the visitor's quote, styled to match the site's
 * own identity (carmine band, serif typography, hairline rules) rather than
 * a generic invoice template. jsPDF is loaded lazily from the click handler
 * so it never lands in the main bundle.
 */

import {
  COMPOSITION_TYPES,
  SIZES,
  formatEUR,
  lineTotal,
  unitPrice,
  type LedgerEntry,
} from "@/lib/pricing";

// Brand palette (kept in sync with the CSS custom properties in globals.css —
// jsPDF can't read CSS variables, so the values are duplicated here).
const CARMINE: [number, number, number] = [156, 43, 63];
const CARMINE_DEEP: [number, number, number] = [124, 32, 50];
const INK: [number, number, number] = [36, 28, 29];
const INK_SOFT: [number, number, number] = [107, 92, 88];
const INK_FAINT: [number, number, number] = [163, 148, 142];
const HAIRLINE: [number, number, number] = [232, 224, 218];
const PAPER: [number, number, number] = [253, 252, 250];
const ROSE_WASH_HEX = "#f6e6e6";
const PAPER_HEX = "#fdfcfa";
const CARMINE_HEX = "#9c2b3f";

const OUTER_PETAL_ANGLES = Array.from({ length: 7 }, (_, i) => i * (360 / 7));
const INNER_PETAL_ANGLES = Array.from({ length: 5 }, (_, i) => i * 72 + 10);

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const BAND_H = 118;

/**
 * jsPDF's built-in fonts (WinAnsi encoding) have no glyph for the narrow
 * no-break space Intl.NumberFormat("fr-FR") uses as a thousands separator —
 * left as-is it renders as a stray "/". Swap it for a plain space.
 */
function pdfMoney(value: number): string {
  return formatEUR(value).replace(/[  ]/g, " ");
}

function reference(): string {
  return `LFP-EST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * The rose mark used everywhere else in the site (see RoseMark.tsx), redrawn
 * with filled petals — jsPDF has no equivalent of the component's thin-stroke
 * engraving style, and outline strokes this small would just blur.
 */
function drawRoseSealPetal(
  ctx: CanvasRenderingContext2D,
  deg: number,
  radius: number,
  inner: boolean
) {
  ctx.save();
  ctx.rotate((deg * Math.PI) / 180);
  if (inner) ctx.scale(0.72, 0.72);
  ctx.scale(radius / 80, radius / 80);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  if (inner) {
    ctx.bezierCurveTo(-14, -8, -17, -28, -4, -42);
    ctx.bezierCurveTo(0, -46, 6, -44, 5, -37);
    ctx.bezierCurveTo(15, -30, 17, -11, 0, 0);
  } else {
    ctx.bezierCurveTo(-26, -14, -30, -48, -8, -72);
    ctx.bezierCurveTo(0, -80, 10, -76, 8, -64);
    ctx.bezierCurveTo(26, -52, 30, -20, 0, 0);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSeal(doc: import("jspdf").jsPDF, cx: number, cy: number, radius: number) {
  doc.setDrawColor(...PAPER);
  doc.setLineWidth(0.8);
  doc.circle(cx, cy, radius, "S");

  const ctx = doc.context2d as unknown as CanvasRenderingContext2D;
  ctx.save();
  ctx.translate(cx, cy + radius * 0.18);

  ctx.fillStyle = PAPER_HEX;
  for (const deg of OUTER_PETAL_ANGLES) {
    drawRoseSealPetal(ctx, deg, radius * 0.82, false);
  }
  ctx.fillStyle = ROSE_WASH_HEX;
  for (const deg of INNER_PETAL_ANGLES) {
    drawRoseSealPetal(ctx, deg, radius * 0.82, true);
  }
  ctx.fillStyle = CARMINE_HEX;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHeaderBand(doc: import("jspdf").jsPDF) {
  doc.setFillColor(...CARMINE);
  doc.rect(0, 0, PAGE_W, BAND_H, "F");

  drawSeal(doc, PAGE_W - MARGIN - 22, BAND_H / 2 - 6, 24);

  doc.setTextColor(...PAPER);
  doc.setFont("times", "bold");
  doc.setFontSize(21);
  doc.text("LA FLEUR DE LA PAIX", MARGIN, 56, { charSpace: 1.6 });

  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text("FLEURISTE ÉVÉNEMENTIEL & MARIAGE — PARIS", MARGIN, 75, {
    charSpace: 1.4,
  });
}

function ensureSpace(
  doc: import("jspdf").jsPDF,
  y: number,
  needed: number
): number {
  if (y + needed <= PAGE_H - 130) return y;
  doc.addPage();
  doc.setFillColor(...CARMINE);
  doc.rect(0, 0, PAGE_W, 6, "F");
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...INK_FAINT);
  doc.text("La Fleur de la Paix — devis (suite)", MARGIN, 34);
  return 64;
}

function drawFooter(doc: import("jspdf").jsPDF) {
  const y = PAGE_H - 70;
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.75);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);

  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_FAINT);
  doc.text(
    "14 RUE DES ROSIERS, 75004 PARIS  ·  01 42 00 00 00  ·  ATELIER@LAFLEURDELAPAIX.FR",
    PAGE_W / 2,
    y + 20,
    { align: "center", charSpace: 0.4 }
  );
}

export type QuotePdfMeta = {
  reference?: string;
  clientName?: string;
};

export async function downloadQuotePdf(
  entries: LedgerEntry[],
  total: number,
  meta: QuotePdfMeta = {}
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const ref = meta.reference || reference();
  const issued = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(new Date());

  doc.setFillColor(...PAPER);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  drawHeaderBand(doc);

  let y = BAND_H + 50;

  // Reference block, right-aligned
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK_FAINT);
  doc.text(`RÉF. ${ref}`, PAGE_W - MARGIN, y - 14, {
    align: "right",
    charSpace: 0.6,
  });
  doc.text(`ÉMIS LE ${issued.toUpperCase()}`, PAGE_W - MARGIN, y, {
    align: "right",
    charSpace: 0.6,
  });

  // Title
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...CARMINE);
  doc.text("ESTIMATION", MARGIN, y - 14, { charSpace: 2 });
  doc.setFont("times", "bolditalic");
  doc.setFontSize(27);
  doc.setTextColor(...INK);
  doc.text(
    meta.clientName ? `Votre devis, ${meta.clientName}` : "Votre devis",
    MARGIN,
    y + 14
  );

  y += 46;

  // Table header
  doc.setFillColor(...[246, 230, 230] as [number, number, number]);
  doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 26, "F");
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...INK_SOFT);
  const colComp = MARGIN + 12;
  const colFormat = MARGIN + 250;
  const colQty = MARGIN + 340;
  const colUnit = MARGIN + 400;
  const colTotal = PAGE_W - MARGIN - 12;
  doc.text("COMPOSITION", colComp, y + 17, { charSpace: 0.6 });
  doc.text("FORMAT", colFormat, y + 17, { charSpace: 0.6 });
  doc.text("QTÉ", colQty, y + 17, { charSpace: 0.6 });
  doc.text("P.U.", colUnit, y + 17, { charSpace: 0.6 });
  doc.text("TOTAL", colTotal, y + 17, { align: "right", charSpace: 0.6 });
  y += 26;

  for (const entry of entries) {
    const type = COMPOSITION_TYPES.find((t) => t.key === entry.typeKey);
    const size = SIZES.find((s) => s.key === entry.size);
    if (!type || !size) continue;

    y = ensureSpace(doc, y, 46);

    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);

    const rowTop = y + 20;
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(type.label, colComp, rowTop);

    doc.setFont("times", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_FAINT);
    doc.text(type.latin, colComp, rowTop + 13);

    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK_SOFT);
    doc.text(size.label, colFormat, rowTop);
    doc.text(String(entry.quantity), colQty, rowTop);
    doc.text(pdfMoney(unitPrice(entry.typeKey, entry.size)), colUnit, rowTop);

    doc.setFont("times", "bold");
    doc.setTextColor(...INK);
    doc.text(pdfMoney(lineTotal(entry)), colTotal, rowTop, {
      align: "right",
    });

    y += 40;
  }

  y = ensureSpace(doc, y, 70);
  doc.setDrawColor(...CARMINE);
  doc.setLineWidth(1.4);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 30;

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("TOTAL ESTIMÉ", MARGIN, y, { charSpace: 1 });
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...CARMINE_DEEP);
  doc.text(pdfMoney(total), PAGE_W - MARGIN, y + 2, { align: "right" });

  y += 40;
  y = ensureSpace(doc, y, 50);
  doc.setFont("times", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK_SOFT);
  const note = doc.splitTextToSize(
    "Cette estimation est indicative et valable 30 jours. La proposition définitive, incluant la disponibilité des fleurs de saison, vous est adressée par l'atelier sous 48h ouvrées.",
    PAGE_W - MARGIN * 2
  );
  doc.text(note, MARGIN, y);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc);
  }

  doc.save(`devis-la-fleur-de-la-paix-${ref}.pdf`);
}
