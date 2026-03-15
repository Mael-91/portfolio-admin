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

  const subject = "Vos données personnelles – export demandé";

  const text = [
    "Bonjour,",
    "",
    "Vous recevez ce message car un export de vos données personnelles a été demandé depuis notre interface d’administration, à partir de votre demande de contact.",
    "",
    "Vous trouverez ci-dessous les informations actuellement enregistrées vous concernant.",
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
    "Si vous n’êtes pas à l’origine de cette demande ou si vous souhaitez exercer un autre droit sur vos données, vous pouvez répondre à ce message.",
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