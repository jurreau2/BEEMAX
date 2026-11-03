import type { Env } from "./types";
import { staffIdentity } from "./access";

interface PeerSession {
  peerId: string;
  identityId: string;
  lastMessageAt: number;
}
interface PositionMessage {
  x: number;
  y: number;
  mode: string;
}

/** Ephemeral, authenticated WebSocket relay for spatial cursor presence. */
export class InstantSpaceDurableObject {
  private readonly sessions = new Map<WebSocket, PeerSession>();

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.sessions.set(server, { peerId: "", identityId: "", lastMessageAt: 0 });

    server.addEventListener("message", (event: MessageEvent) => {
      void this.handleMessage(server, event.data);
    });
    server.addEventListener("close", () => this.removeSession(server));
    server.addEventListener("error", () => this.removeSession(server));
    setTimeout(() => {
      const session = this.sessions.get(server);
      if (session && !session.identityId) server.close(1008, "Authentication required");
    }, 10_000);

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleMessage(socket: WebSocket, raw: string | ArrayBuffer) {
    const session = this.sessions.get(socket);
    if (!session) return;

    if (typeof raw !== "string" || raw.length > 2048) {
      socket.close(1009, "Invalid message size");
      return;
    }

    let message: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      message = parsed as Record<string, unknown>;
    } catch {
      socket.close(1007, "Invalid JSON");
      return;
    }

    if (!session.identityId) {
      if (
        message.type !== "auth" ||
        typeof message.token !== "string" ||
        message.token.length < 1 ||
        message.token.length > 4096 ||
        typeof message.peerId !== "string" ||
        !/^[a-zA-Z0-9_-]{1,80}$/.test(message.peerId)
      ) {
        socket.close(1008, "Authentication required");
        return;
      }
      const identity = await staffIdentity(
        new Request("https://portal.internal/api/session", {
          headers: { Authorization: `Bearer ${message.token}` },
        }),
        this.env,
      );
      if (!identity) {
        socket.close(1008, "Invalid credentials");
        return;
      }

      session.identityId = identity.id;
      session.peerId = message.peerId;
      socket.send(JSON.stringify({ type: "ready" }));
      for (const [otherSocket, otherSession] of this.sessions) {
        if (otherSocket !== socket && otherSession.identityId) {
          const position = (otherSession as PeerSession & { position?: PositionMessage }).position;
          if (position) {
            socket.send(JSON.stringify({ type: "peer", id: otherSession.peerId, ...position }));
          }
        }
      }
      return;
    }

    const now = Date.now();
    if (now - session.lastMessageAt < 40) return;
    if (
      typeof message.x !== "number" || !Number.isFinite(message.x) || message.x < 0 || message.x > 1 ||
      typeof message.y !== "number" || !Number.isFinite(message.y) || message.y < 0 || message.y > 1 ||
      typeof message.mode !== "string" || message.mode.length > 100
    ) {
      socket.close(1008, "Invalid position");
      return;
    }

    session.lastMessageAt = now;
    const position: PositionMessage = { x: message.x, y: message.y, mode: message.mode };
    (session as PeerSession & { position?: PositionMessage }).position = position;
    const payload = JSON.stringify({ type: "peer", id: session.peerId, ...position });
    for (const [otherSocket, otherSession] of this.sessions) {
      if (otherSocket !== socket && otherSession.identityId) {
        try {
          otherSocket.send(payload);
        } catch {
          this.removeSession(otherSocket);
        }
      }
    }
  }

  private removeSession(socket: WebSocket) {
    const session = this.sessions.get(socket);
    if (!session) return;
    this.sessions.delete(socket);
    if (!session.identityId) return;
    const payload = JSON.stringify({ type: "leave", id: session.peerId });
    for (const [otherSocket, otherSession] of this.sessions) {
      if (otherSession.identityId) {
        try {
          otherSocket.send(payload);
        } catch {
          this.sessions.delete(otherSocket);
        }
      }
    }
  }
}
