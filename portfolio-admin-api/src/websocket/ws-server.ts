import { WebSocketServer, WebSocket } from "ws";
import { env } from "../env";

type BroadcastPayload =
  | {
      type: "connected";
      unprocessedCount: number;
      timestamp: string;
    }
  | {
      type: "message:new";
      unprocessedCount: number;
      diff?: number;
      timestamp: string;
    }
  | {
      type: "rgpd:purge";
      unprocessedCount: number;
      deletedCount: number;
      timestamp: string;
    };

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

function safeSend(ws: WebSocket, payload: BroadcastPayload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

export function startWebSocketServer(params: {
  getUnprocessedCount: () => Promise<number>;
}) {
  if (wss) {
    return wss;
  }

  wss = new WebSocketServer({
    host: env.wsHost,
    port: env.wsPort,
  });

  wss.on("connection", async (ws) => {
    clients.add(ws);

    try {
      const unprocessedCount = await params.getUnprocessedCount();

      safeSend(ws, {
        type: "connected",
        unprocessedCount,
        timestamp: new Date().toISOString(),
      });
    } catch {
      safeSend(ws, {
        type: "connected",
        unprocessedCount: 0,
        timestamp: new Date().toISOString(),
      });
    }

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", () => {
      clients.delete(ws);
    });
  });

  console.log(`WebSocket server listening on ws://${env.wsHost}:${env.wsPort}`);

  return wss;
}

export function broadcastNewMessage(payload: {
  unprocessedCount: number;
  diff?: number;
}) {
  const message: BroadcastPayload = {
    type: "message:new",
    unprocessedCount: payload.unprocessedCount,
    diff: payload.diff,
    timestamp: new Date().toISOString(),
  };

  for (const client of clients) {
    safeSend(client, message);
  }
}

export function broadcastRgpdPurge(payload: {
  unprocessedCount: number;
  deletedCount: number;
}) {
  const message: BroadcastPayload = {
    type: "rgpd:purge",
    unprocessedCount: payload.unprocessedCount,
    deletedCount: payload.deletedCount,
    timestamp: new Date().toISOString(),
  };

  for (const client of clients) {
    safeSend(client, message);
  }
}