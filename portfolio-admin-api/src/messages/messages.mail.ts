import nodemailer from "nodemailer";
import { env } from "../env";
import { MessageDetail } from "./messages.types";

const transporter = nodemailer.createTransport({
  host: env.mailHost,
  port: env.mailPort,
  secure: env.mailSecure,
  auth: env.mailUser
    ? {
        user: env.mailUser,
        pass: env.mailPass,
      }
    : undefined,
});

function formatRequestType(type: string): string {
  switch (type) {
    case "pro":
      return "Professionnel";
    case "part":
      return "Particulier";
    case "info":
      return "Demande d'information";
    default:
      return type;
  }
}

function formatProcessingStatus(status: string): string {
  switch (status) {
    case "processed":
      return "Traité";
    case "in_progress":
      return "En cours";
    case "unprocessed":
    default:
      return "Non traité";
  }
}

export async function sendRgpdExportEmail(params: {
  to: string;
  message: MessageDetail;
}) {
  const { to, message } = params;

  const subject = "Vos données personnelles - maelconstantin.fr";

  const text = buildRgpdExportEmailText({
    id: message.id,
    request_type: formatRequestType(message.requestType),
    first_name: message.firstName || "",
    last_name: message.lastName || "",
    company: message.company || "",
    email: message.email,
    phone: message.phone || "",
    allow_phone_contact: message.allowPhoneContact,
    consent_privacy: message.consentPrivacy,
    processing_status: formatProcessingStatus(message.processingStatus),
    created_at: message.createdAt,
    message_text: message.messageText,
  });

  const html = buildRgpdExportEmailHtml({
    id: message.id,
    request_type: formatRequestType(message.requestType),
    first_name: message.firstName || "",
    last_name: message.lastName || "",
    company: message.company || "",
    email: message.email,
    phone: message.phone || "",
    allow_phone_contact: message.allowPhoneContact,
    consent_privacy: message.consentPrivacy,
    processing_status: formatProcessingStatus(message.processingStatus),
    created_at: message.createdAt,
    message_text: message.messageText,
  });

  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text,
    html,
  });
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildRgpdExportEmailHtml(data: any) {
  const fullName =
    [data.first_name, data.last_name].filter(Boolean).join(" ") || "Utilisateur";

  const row = (label: string, value: string | null | undefined) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;width:220px;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">
        ${escapeHtml(value || "-")}
      </td>
    </tr>
  `;

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vos données personnelles - Exportation de vos données</title>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial;">
      <div style="max-width:720px;margin:auto;padding:24px;">
        <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

          <div style="padding:20px;background:#111827;color:#fff;">
            <h1 style="margin:0;font-size:20px;">Export de vos données personnelles</h1>
          </div>

          <div style="padding:20px;">
            <p>Bonjour ${escapeHtml(fullName)},</p>
            <p>
              Vous recevez ce message car un export de vos données personnelles a été demandé depuis notre interface d’administration, à partir de votre demande de contact.
              <br />
              <br />
              Si vous n’êtes pas à l’origine de cette demande ou si vous souhaitez exercer un autre droit sur vos données, vous pouvez répondre à ce message.
              <br />
              <br />
              Vous trouverez ci-dessous les informations actuellement enregistrées vous concernant.
            </p>

            <table width="100%" style="border-collapse:collapse;">
              ${row("Type", data.request_type)}
              ${row("Email", data.email)}
              ${row("Téléphone", data.phone)}
              ${row("Entreprise", data.company)}
              ${row("Date", data.created_at)}
            </table>

            <div style="margin-top:20px;">
              <h2 style="font-size:16px;">Message</h2>
              <div style="padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;white-space:pre-wrap;">
                ${escapeHtml(data.message_text)}
              </div>
            </div>
          </div>

          <div style="padding:16px;background:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="font-size:12px;color:#6b7280;margin:0;">
              Administration de maelconstantin.fr
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function buildRgpdExportEmailText(data: any) {
  return `
    Bonjour,
    
    Vous recevez ce message car un export de vos données personnelles a été demandé depuis notre interface d’administration, à partir de votre demande de contact.

    Vous trouverez ci-dessous les informations actuellement enregistrées vous concernant.

    Identifiant : ${data.id}
    Type de demande : ${formatRequestType(data.request_type)}
    Prénom : ${data.first_name || ""}
    Nom : ${data.last_name || ""}
    Société : ${data.company || ""}
    Email : ${data.email}
    Téléphone : ${data.phone || ""}
    Contact téléphonique autorisé : ${data.allow_phone_contact ? "Oui" : "Non"}
    Consentement confidentialité : ${data.consent_privacy ? "Oui" : "Non"}
    Statut de traitement : ${formatProcessingStatus(data.processing_status)}
    Date de création : ${data.created_at}

    Message :
    ${data.message_text || ""}

    Si vous n’êtes pas à l’origine de cette demande ou si vous souhaitez exercer un autre droit sur vos données, vous pouvez répondre à ce message.",

    Cordialement,
    Administration maelconstantin.fr
  `;
}