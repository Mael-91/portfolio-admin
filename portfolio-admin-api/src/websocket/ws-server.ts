import type { IncomingMessage } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { env } from "../env";
import { consumeSocketTicket, type SocketIdentity } from "./ws-access";

type Channels = { messages: boolean; rgpd: boolean };
type CheckAccess = (identity: SocketIdentity) => Promise<Channels | null>;
type Channel = keyof Channels;
type Payload = Record<string, string | number | undefined>;

type Client = { identity: SocketIdentity; channels: Channels };
const clients = new Map<WebSocket, Client>();
let wss: WebSocketServer | null = null;
let checkAccess: CheckAccess;

async function currentAccess(ws: WebSocket, client: Client) {
  try {
    const channels = await checkAccess(client.identity);
    if (channels && (channels.messages || channels.rgpd)) {
      if (channels.messages === client.channels.messages && channels.rgpd === client.channels.rgpd) return channels;
      ws.close(4001, "Droits modifiés");
      return null;
    }
  } catch {
    ws.close(1011, "Vérification indisponible");
    return null;
  }
  ws.close(1008, "Accès révoqué");
  return null;
}

async function send(ws: WebSocket, client: Client, channel: Channel, payload: Payload) {
  const access = await currentAccess(ws, client);
  if (access?.[channel] && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ ...payload, timestamp: new Date().toISOString() }));
  }
}

export function startWebSocketServer(params: {
  getUnprocessedCount: () => Promise<number>;
  checkAccess: CheckAccess;
}) {
  if (wss) return wss;
  checkAccess = params.checkAccess;
  const admitted = new WeakMap<IncomingMessage, Client>();
  wss = new WebSocketServer({
    host: env.wsHost,
    port: env.wsPort,
    maxPayload: 1024,
    handleProtocols: (protocols) => protocols.has("rbac-v1") ? "rbac-v1" : false,
    verifyClient: ({ req }, done) => {
      const protocols = req.headers["sec-websocket-protocol"]?.split(",").map((value) => value.trim());
      const token = protocols?.find((value) => value.startsWith("ticket."));
      if (req.headers.origin !== env.corsOrigin || !protocols?.includes("rbac-v1") ||
          !token || !/^ticket\.[A-Za-z0-9_-]{43}$/.test(token)) {
        done(false, 403);
        return;
      }

      const identity = consumeSocketTicket(token.slice("ticket.".length));
      if (!identity) {
        done(false, 401);
        return;
      }

      void checkAccess(identity).then((channels) => {
        if (!channels || !(channels.messages || channels.rgpd)) {
          done(false, 403);
          return;
        }
        admitted.set(req, { identity, channels });
        done(true);
      }, () => done(false, 503));
    },
  });

  wss.on("connection", (ws, req) => {
    const client = admitted.get(req);
    if (!client) {
      ws.close(1008);
      return;
    }
    clients.set(ws, client);
    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => { clients.delete(ws); ws.terminate(); });
    void currentAccess(ws, client).then(async (channels) => {
      if (channels?.messages) {
        const unprocessedCount = await params.getUnprocessedCount().catch(() => undefined);
        await send(ws, client, "messages", { type: "connected", unprocessedCount });
      }
    });
  });

  const timer = setInterval(() => {
    for (const [ws, client] of clients) void currentAccess(ws, client);
  }, 5000);
  timer.unref();
  wss.once("close", () => clearInterval(timer));
  return wss;
}

export function broadcastNewMessage(payload: { unprocessedCount: number; diff?: number }) {
  for (const [ws, client] of clients) {
    void send(ws, client, "messages", { type: "message:new", ...payload });
  }
}

export function broadcastRgpdPurge(payload: { unprocessedCount: number; deletedCount: number }) {
  for (const [ws, client] of clients) {
    void send(ws, client, "messages", { type: "message:count", unprocessedCount: payload.unprocessedCount });
    void send(ws, client, "rgpd", { type: "rgpd:purge", deletedCount: payload.deletedCount });
  }
}
