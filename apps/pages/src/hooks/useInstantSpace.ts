import { useCallback, useEffect, useRef, useState } from "react";

export interface PeerCursor {
  id: string;
  x: number;
  y: number;
  mode: string;
}

interface SpaceMessage {
  type?: string;
  id?: string;
  x?: number;
  y?: number;
  mode?: string;
}

/** Authenticates with the Worker before receiving or broadcasting cursor state. */
export function useInstantSpace(
  peerId: string,
  currentMode: string,
  accessToken: string,
) {
  const [peers, setPeers] = useState<Map<string, PeerCursor>>(() => new Map());
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const modeRef = useRef(currentMode);
  const positionRef = useRef<{ x: number; y: number } | null>(null);
  modeRef.current = currentMode;

  useEffect(() => {
    if (!accessToken) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/space/ws`);
    wsRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "auth", token: accessToken, peerId }));
    };
    socket.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as SpaceMessage;
        if (data.type === "ready") {
          setConnected(true);
          const position = positionRef.current;
          if (position && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ ...position, mode: modeRef.current }));
          }
        } else if (data.type === "leave" && data.id) {
          setPeers((previous) => {
            const next = new Map(previous);
            next.delete(data.id!);
            return next;
          });
        } else if (
          data.type === "peer" &&
          data.id &&
          data.id !== peerId &&
          Number.isFinite(data.x) &&
          Number.isFinite(data.y) &&
          typeof data.mode === "string"
        ) {
          setPeers((previous) => {
            const next = new Map(previous);
            next.set(data.id!, { id: data.id!, x: data.x!, y: data.y!, mode: data.mode! });
            return next;
          });
        }
      } catch {
        console.error("Malformed instant space telemetry");
      }
    };
    socket.onclose = () => {
      setConnected(false);
      setPeers(new Map());
      if (wsRef.current === socket) wsRef.current = null;
    };
    socket.onerror = () => setConnected(false);

    return () => {
      socket.close();
      if (wsRef.current === socket) wsRef.current = null;
    };
  }, [accessToken, peerId]);

  const broadcastPosition = useCallback((x: number, y: number) => {
    const position = { x, y };
    positionRef.current = position;
    const socket = wsRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ ...position, mode: modeRef.current }));
    }
  }, []);

  return { peers: Array.from(peers.values()), broadcastPosition, connected };
}
