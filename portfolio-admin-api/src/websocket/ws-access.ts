import { randomBytes } from "node:crypto";

export type SocketIdentity = { sessionId: string; userId: number };

const tickets = new Map<string, { identity: SocketIdentity; expiresAt: number }>();
const ticketLifetime = 30_000;
const ticketLimit = 4096;

export function issueSocketTicket(identity: SocketIdentity, now = Date.now()) {
  for (const [ticket, entry] of tickets) {
    if (entry.expiresAt <= now) tickets.delete(ticket);
  }
  if (tickets.size >= ticketLimit) return null;
  const ticket = randomBytes(32).toString("base64url");
  tickets.set(ticket, { identity, expiresAt: now + ticketLifetime });
  return ticket;
}

export function consumeSocketTicket(ticket: string, now = Date.now()) {
  const entry = tickets.get(ticket);
  tickets.delete(ticket);
  return entry && entry.expiresAt > now ? entry.identity : null;
}

export function getSocketChannels(permissions: string[]) {
  return { messages: permissions.includes("messages.read"), rgpd: permissions.includes("rgpd.read") };
}
