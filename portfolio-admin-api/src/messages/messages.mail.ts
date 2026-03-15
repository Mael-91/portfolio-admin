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

  const subject = "Export de vos données personnelles";

  const text = [
    "Bonjour,",
    "",
    "Voici les données vous concernant enregistrées via le formulaire de contact.",
    "",
    `Identifiant : ${message.id}`,
    `Type de demande : ${formatRequestType(message.requestType)}`,
    `Prénom : ${message.firstName || ""}`,
    `Nom : ${message.lastName || ""}`,
    `Société : ${message.company || ""}`,
    `Email : ${message.email}`,
    `Téléphone : ${message.phone || ""}`,
    `Contact téléphonique autorisé : ${message.allowPhoneContact ? "Oui" : "Non"}`,
    `Consentement confidentialité : ${message.consentPrivacy ? "Oui" : "Non"}`,
    `Statut de traitement : ${formatProcessingStatus(message.processingStatus)}`,
    `Date de création : ${message.createdAt}`,
    "",
    "Message :",
    message.messageText,
    "",
    "Ceci est un export de vos données à caractère personnel.",
    "",
    "Cordialement,",
    "Administration maelconstantin.fr",
  ].join("\n");

  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text,
  });
}