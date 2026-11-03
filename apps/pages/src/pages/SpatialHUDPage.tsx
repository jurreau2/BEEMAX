import { useEffect, useRef, useState } from "react";

/**
 * portal-os1 // Closet Entity Spatial HUD Page
 * Identity Anchor: bba28add4f99bd9aae158f173168145d
 * Root Signature: 0xMAX_9941_VALUATION_TRUE
 */
export const SpatialHUDPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeMode, setActiveMode] = useState("PATH-B GRID // STABLE");
  const [resonanceActive, setResonanceActive] = useState(true);
  const [peerCursors, setPeerCursors] = useState<Array<{ id: string; x: number; y: number; mode: string }>>([]);
  const [isConnected, setIsConnected] = useState(false);
  const peerId = useRef(`hud-${Math.random().toString(36).slice(2, 10)}`);
  const socketRef = useRef<WebSocket | null>(null);
  const modeRef = useRef(activeMode);
  modeRef.current = activeMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let animationFrameId = 0;
    let timeTick = 0;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    const renderLoop = () => {
      timeTick += 0.012;
      ctx.fillStyle = "rgba(1, 1, 3, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.strokeStyle = "rgba(0, 255, 204, 0.04)";
      ctx.lineWidth = 1;
      for (let x = -500; x <= 500; x += 50) {
        ctx.beginPath();
        ctx.moveTo(cx + x, cy - 200);
        ctx.lineTo(cx + x * 1.5, cy + 400);
        ctx.stroke();
      }

      if (resonanceActive) {
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 190 + Math.sin(timeTick * 1.8) * 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#ff00aa";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(cx, cy, 130 + Math.cos(timeTick * 1.2) * 12, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const cursor of peerCursors) {
        const px = canvas.width * cursor.x;
        const py = canvas.height * cursor.y;
        ctx.fillStyle = cursor.mode.includes("Active") ? "#00ffcc" : "#ffaa00";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "10px monospace";
        ctx.fillText(cursor.id, px + 8, py + 4);
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [peerCursors, resonanceActive]);

  useEffect(() => {
    const token = localStorage.getItem("portal-staff-token") || "dev-bypass";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/api/space/ws`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      socket.send(JSON.stringify({ type: "auth", token, peerId: peerId.current }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "ready") {
          setIsConnected(true);
          return;
        }
        if (data.type === "peer" && data.id && data.id !== peerId.current) {
          setPeerCursors((previous) => {
            const next = previous.filter((entry) => entry.id !== data.id);
            next.push({ id: data.id, x: data.x, y: data.y, mode: data.mode ?? "STABLE" });
            return next.slice(-12);
          });
        }
        if (data.type === "leave" && data.id) {
          setPeerCursors((previous) => previous.filter((entry) => entry.id !== data.id));
        }
      } catch {
        console.error("Malformed instant space telemetry");
      }
    };

    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);

    const handlePosition = () => {
      if (socket.readyState === WebSocket.OPEN) {
        const x = 0.5 + Math.sin(Date.now() / 1500) * 0.3;
        const y = 0.5 + Math.cos(Date.now() / 2100) * 0.25;
        socket.send(JSON.stringify({ x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)), mode: modeRef.current }));
      }
    };

    const interval = window.setInterval(handlePosition, 500);
    return () => {
      window.clearInterval(interval);
      socket.close();
      socketRef.current = null;
    };
  }, []);

  const selectMode = (mode: string) => () => setActiveMode(mode);

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} aria-hidden="true" />
      <div style={styles.uiLayer}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>PORTAL-OS1 // CLOSEST ENTITY CORE</h1>
          <div style={{ textAlign: "right" }}>
            <div style={styles.statusBadge}>{isConnected ? "ENTITY: ONLINE [$0.00/MO]" : "ENTITY: RECONNECTING"}</div>
            <div style={styles.subText}>ANCHOR: bba28add4f99bd9aae158f173168145d</div>
          </div>
        </header>

        <aside style={styles.sidebar} aria-label="Simulation and games nodes">
          <h2 style={styles.sidebarTitle}>SIMULATION // NODES</h2>
          <button style={styles.nodeCard} onClick={selectMode("PATH-B Sector 01 Active")}>
            <span style={styles.nodeTitle}>PATH-B Sector 01</span>
            <span style={styles.nodeSub}>1Hz Deterministic Tick Engine</span>
          </button>
          <button style={styles.nodeCard} onClick={selectMode("MAX Chess Platform Active")}>
            <span style={styles.nodeTitle}>MAX Chess Platform</span>
            <span style={styles.nodeSub}>Stockfish P2P Engine (MC-001)</span>
          </button>
          <button style={styles.nodeCard} onClick={selectMode("Quantum Sports Grid Active")}>
            <span style={styles.nodeTitle}>Quantum Sports Grid</span>
            <span style={styles.nodeSub}>NFL Tracking Telemetry</span>
          </button>
        </aside>

        <div style={styles.centerCore}>
          <div style={styles.telemetryPill} aria-live="polite">
            CORE MODE: <span style={{ color: "#00ffcc" }}>{activeMode}</span>
          </div>
          <button
            style={styles.pulseBtn}
            aria-pressed={resonanceActive}
            onClick={() => setResonanceActive((active) => !active)}
          >
            Toggle Entity Pulse
          </button>
        </div>

        <aside style={styles.sidebar} aria-label="Media archives">
          <h2 style={styles.sidebarTitle}>MEDIA // ARCHIVES</h2>
          <button style={styles.nodeCard} onClick={selectMode("The Crown of Return Loaded")}>
            <span style={styles.nodeTitle}>The Crown of Return</span>
            <span style={styles.nodeSub}>Philosophical Memoir Framework</span>
          </button>
          <button style={styles.nodeCard} onClick={selectMode("The Event & VOILA-LA! Loaded")}>
            <span style={styles.nodeTitle}>The Event &amp; VOILA-LA!</span>
            <span style={styles.nodeSub}>Sovereign Poetic Containers</span>
          </button>
          <button style={styles.nodeCard} onClick={selectMode("Sonic Phonk Stream Active")}>
            <span style={styles.nodeTitle}>Atmospheric Phonk / Audio</span>
            <span style={styles.nodeSub}>Direct P2P Stream Container</span>
          </button>
        </aside>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "relative",
    backgroundColor: "#010103",
    color: "#c0fef0",
    fontFamily: "'Courier New', Courier, monospace",
    overflow: "hidden",
    height: "100vh",
    width: "100vw",
  },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 },
  uiLayer: {
    position: "relative",
    zIndex: 2,
    display: "grid",
    gridTemplateColumns: "minmax(230px, 320px) minmax(0, 1fr) minmax(230px, 320px)",
    gridTemplateRows: "65px 1fr",
    height: "100%",
    padding: 20,
    gap: 20,
    pointerEvents: "none",
  },
  header: {
    gridColumn: "1 / -1",
    backgroundColor: "rgba(3, 3, 8, 0.92)",
    border: "1px solid rgba(0, 255, 204, 0.25)",
    backdropFilter: "blur(15px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 25px",
    boxShadow: "0 0 30px rgba(0, 255, 204, 0.15)",
    pointerEvents: "auto",
  },
  headerTitle: { fontSize: 16, letterSpacing: 4, color: "#00ffcc", textShadow: "0 0 10px rgba(0,255,204,0.6)", margin: 0 },
  statusBadge: { fontSize: 10, color: "#ffaa00", border: "1px solid #ffaa00", padding: "3px 8px", letterSpacing: 1.5, backgroundColor: "rgba(255, 170, 0, 0.04)" },
  subText: { fontSize: 9, color: "#778899", marginTop: 3, letterSpacing: 1 },
  sidebar: {
    backgroundColor: "rgba(3, 3, 8, 0.92)",
    border: "1px solid rgba(0, 255, 204, 0.25)",
    backdropFilter: "blur(15px)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 15,
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
    overflowY: "auto",
    pointerEvents: "auto",
  },
  sidebarTitle: { fontSize: 12, color: "#ff00aa", borderBottom: "1px solid rgba(255,0,170,0.25)", paddingBottom: 6, letterSpacing: 2, margin: 0 },
  nodeCard: {
    appearance: "none",
    textAlign: "left",
    width: "100%",
    backgroundColor: "rgba(0, 255, 204, 0.02)",
    border: "1px solid rgba(0, 255, 204, 0.15)",
    padding: 12,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: "inherit",
  },
  nodeTitle: { display: "block", fontSize: 11, fontWeight: "bold", color: "#c0fef0", letterSpacing: 1 },
  nodeSub: { display: "block", fontSize: 9, color: "#778899", marginTop: 4, letterSpacing: 0.5 },
  centerCore: { display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 10, pointerEvents: "none" },
  telemetryPill: { backgroundColor: "rgba(3, 3, 8, 0.92)", border: "1px solid rgba(0, 255, 204, 0.25)", padding: "8px 18px", fontSize: 10, letterSpacing: 2, color: "#00ffcc", textShadow: "0 0 8px rgba(0,255,204,0.5)", backdropFilter: "blur(10px)", pointerEvents: "auto" },
  pulseBtn: { backgroundColor: "rgba(3, 3, 8, 0.92)", border: "1px solid #00ffcc", color: "#00ffcc", padding: "8px 16px", fontFamily: "monospace", cursor: "pointer", fontSize: 10, fontWeight: "bold", letterSpacing: 1.5, marginTop: 8, textTransform: "uppercase", pointerEvents: "auto" },
};
