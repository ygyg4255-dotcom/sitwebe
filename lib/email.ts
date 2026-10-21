/**
 * Resend e-mail notifications (Phase 5).
 *
 * When a visitor submits a booking request or a contact inquiry, the
 * agency is notified by e-mail via Resend (https://resend.com).
 *
 * Configuration (.env.local): RESEND_API_KEY + RESEND_FROM_EMAIL.
 * The recipient is the agency's own contact address (site_settings /
 * default branding — see lib/config/site.ts).
 *
 * This module NEVER throws and NEVER blocks a successful insert: the row
 * is already safely stored in the database, so a missing key, a network
 * failure, or a Resend error is only logged — the visitor's submission
 * still succeeds. When the environment variables are absent (e.g. local
 * development without Resend), sending is skipped gracefully.
 */
import "server-only";
import { Resend } from "resend";
import { getBranding } from "@/lib/config/site";
import type { BookingInput, InquiryInput } from "@/lib/validation";

/** Minimal config needed to send — null when Resend is not configured. */
function resendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    // Graceful skip: no Resend credentials → no e-mail, no error.
    return null;
  }
  return { apiKey, from };
}

/** Escapes user-provided text before it lands in the HTML body. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** One <tr> row for the details table of a notification e-mail. */
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px;font-weight:600;background:#f1e5d0;">${label}</td>
    <td style="padding:6px 12px;">${value}</td>
  </tr>`;
}

const tableStyle =
  'border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2b2118;';

/**
 * Low-level send. Returns true when the e-mail was accepted by Resend,
 * false on any failure (already logged) — callers ignore the result.
 */
async function sendToAgency(subject: string, html: string): Promise<boolean> {
  const config = resendConfig();
  if (!config) return false;

  const { contact } = await getBranding();

  try {
    const resend = new Resend(config.apiKey);
    const { error } = await resend.emails.send({
      from: config.from,
      to: contact.email,
      subject,
      html,
    });

    if (error) {
      console.error("Resend send failed:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send threw:", err);
    return false;
  }
}

/**
 * Notifies the agency of a new booking request (called by submitBooking
 * after the row is safely inserted). `tourTitle` is optional because a
 * booking can reference a departure without a tour.
 */
export async function sendBookingNotification(
  booking: BookingInput,
  tourTitle: string | null
): Promise<void> {
  const rows = [
    row("Nom", escapeHtml(booking.fullName)),
    row("E-mail", escapeHtml(booking.email)),
    ...(booking.phone ? [row("Téléphone", escapeHtml(booking.phone))] : []),
    ...(tourTitle ? [row("Circuit", escapeHtml(tourTitle))] : []),
    ...(booking.travelDate
      ? [row("Date de voyage", escapeHtml(booking.travelDate))]
      : []),
    row(
      "Voyageurs",
      `${booking.numAdults} adulte(s)${
        booking.numChildren ? `, ${booking.numChildren} enfant(s)` : ""
      }`
    ),
    ...(booking.message
      ? [row("Message", escapeHtml(booking.message).replaceAll("\n", "<br />"))]
      : []),
  ];

  await sendToAgency(
    `Nouvelle demande de réservation — ${booking.fullName}`,
    `<div style="${tableStyle}">
      <h2>Nouvelle demande de réservation</h2>
      <p style="font-size:14px;">Une nouvelle demande vient d'arriver via le site web.</p>
      <table style="${tableStyle}">${rows.join("")}</table>
      <p style="font-size:13px;color:#7c6f60;">
        Retrouvez et suivez cette demande dans le tableau de bord (/admin).
      </p>
    </div>`
  );
}

/**
 * Notifies the agency of a new contact inquiry (called by submitInquiry
 * after the row is safely inserted).
 */
export async function sendInquiryNotification(
  inquiry: InquiryInput
): Promise<void> {
  const rows = [
    row("Nom", escapeHtml(inquiry.name)),
    row("E-mail", escapeHtml(inquiry.email)),
    ...(inquiry.subject ? [row("Sujet", escapeHtml(inquiry.subject))] : []),
    row("Message", escapeHtml(inquiry.message).replaceAll("\n", "<br />")),
  ];

  await sendToAgency(
    `Nouveau message de contact — ${inquiry.name}`,
    `<div style="${tableStyle}">
      <h2>Nouveau message de contact</h2>
      <p style="font-size:14px;">Un visiteur vient d'écrire via le formulaire de contact.</p>
      <table style="${tableStyle}">${rows.join("")}</table>
      <p style="font-size:13px;color:#7c6f60;">
        Retrouvez ce message dans la boîte de réception (/admin).
      </p>
    </div>`
  );
}