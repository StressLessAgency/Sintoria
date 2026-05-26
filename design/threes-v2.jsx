import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";

/* ================================================================
   THREES — Top-tier underground dice
   Design: Full-screen immersive. Single overhead light source.
   The table dominates. UI recedes until needed.
   ================================================================ */

// ── Palette ─────────────────────────────────────────────
const C = {
  bg: "#08070C",
  surface: "#0F0E14",
  card: "#13121A",
  felt: "#0A1F10",
  feltLight: "#0E2A16",
  gold: "#D4972E",
  goldHot: "#FFCC44",
  goldMute: "rgba(212,151,46,0.07)",
  red: "#E23B3B",
  redDim: "rgba(226,59,59,0.12)",
  green: "#34B86A",
  greenDim: "rgba(52,184,106,0.1)",
  text: "#DCD5C8",
  sub: "#7A756C",
  dim: "#3E3A34",
  border: "rgba(212,151,46,0.08)",
  borderHi: "rgba(212,151,46,0.18)",
};

const mono = "'JetBrains Mono', 'DM Mono', 'SF Mono', monospace";
const display = "'Playfair Display', 'Cinzel', Georgia, serif";
const body = "'Inter', 'DM Sans', -apple-system, sans-serif";

// ── Utilities ───────────────────────────────────────────
const money = (c) => "$" + (Math.abs(c)/100).toFixed(2);
const roll6 = () => Array.from({length:6},()=>Math.floor(Math.random()*6)+1);
const sc = (d) => d.reduce((a,v) => a+(v===3?0:v), 0);

// ── Pip positions for dice faces ────────────────────────
const PIPS = {
  1:[[1,1]], 2:[[0,2],[2,0]], 3:[[0,2],[1,1],[2,0]],
  4:[[0,0],[0,2],[2,0],[2,2]], 5:[[0,0],[0,2],[1,1],[2,0],[2,2]],
  6:[[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]],
};

// ── Die Component ───────────────────────────────────────
function Die({ value, rolling, delay=0, size=60, glow=false }) {
  const [face, setFace] = useState(value);
  const [anim, setAnim] = useState(false);
  const timerRef = useRef(null);
  const intRef = useRef(null);

  useEffect(() => {
    if (rolling) {
      setAnim(true);
      intRef.current = setInterval(() => setFace(Math.floor(Math.random()*6)+1), 55);
      timerRef.current = setTimeout(() => {
        clearInterval(intRef.current);
        setFace(value);
        setAnim(false);
      }, 600 + delay + Math.random()*200);
      return () => { clearInterval(intRef.current); clearTimeout(timerRef.current); };
    }
    setFace(value); setAnim(false);
  }, [rolling, value, delay]);

  const isThree = face === 3 && !anim;
  const pips = PIPS[face] || [];
  const r = size * 0.16;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.7 }}
      animate={{
        opacity: 1, y: 0,
        scale: isThree ? 0.9 : 1,
        rotate: anim ? [0, 12, -8, 4, 0] : 0,
      }}
      transition={{
        opacity: { duration: 0.25, delay: delay/1000 },
        y: { type: "spring", damping: 16, delay: delay/1000 },
        scale: { type: "spring", damping: 14 },
        rotate: { duration: 0.4, delay: delay/1000 },
      }}
      style={{ width: size, height: size, position: "relative", flexShrink: 0 }}
    >
      {/* Ground shadow */}
      <div style={{
        position: "absolute", bottom: -3, left: "12%", right: "12%", height: 6,
        background: "rgba(0,0,0,0.5)", borderRadius: "50%",
        filter: "blur(4px)", opacity: isThree ? 0.3 : 0.6,
      }}/>

      {/* Die body */}
      <div style={{
        width: "100%", height: "100%", borderRadius: r,
        background: isThree
          ? "linear-gradient(145deg, #2A1215 0%, #1A0A0C 100%)"
          : "linear-gradient(145deg, #EEEAD8 0%, #D8D2C2 50%, #C8C0B0 100%)",
        border: isThree
          ? "1.5px solid rgba(226,59,59,0.35)"
          : "1px solid rgba(180,170,150,0.3)",
        boxShadow: isThree
          ? "0 2px 8px rgba(226,59,59,0.15), inset 0 1px 0 rgba(255,255,255,0.03)"
          : glow
            ? `0 0 20px rgba(255,204,68,0.2), 0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)`
            : "0 3px 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45)",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gridTemplateRows: "1fr 1fr 1fr", padding: "18%",
        position: "relative",
      }}>
        {[0,1,2].flatMap(row => [0,1,2].map(col => {
          const has = pips.some(([pr,pc]) => pr===row && pc===col);
          return (
            <div key={`${row}${col}`} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {has && (
                <div style={{
                  width: size*0.15, height: size*0.15, borderRadius: "50%",
                  background: isThree
                    ? "radial-gradient(circle at 40% 35%, #E23B3B, #8A1E1E)"
                    : "radial-gradient(circle at 40% 35%, #333028, #1A1814)",
                  boxShadow: isThree
                    ? "0 0 3px rgba(226,59,59,0.3), inset 0 -1px 1px rgba(0,0,0,0.2)"
                    : "inset 0 1px 2px rgba(0,0,0,0.25)",
                }}/>
              )}
            </div>
          );
        }))}
      </div>

      {/* Dead badge */}
      {isThree && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, delay: delay/1000+0.3 }}
          style={{
            position: "absolute", top: -4, right: -4,
            width: 16, height: 16, borderRadius: "50%",
            background: C.red, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 6px rgba(226,59,59,0.4)",
            fontSize: 8, color: "#fff", fontWeight: 800,
          }}>✕</motion.div>
      )}
    </motion.div>
  );
}

// ── Dice Tray ───────────────────────────────────────────
function DiceTray({ dice, rolling, size=60, glow=false }) {
  if (!dice) return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[...Array(6)].map((_,i) => (
        <div key={i} style={{
          width: size, height: size, borderRadius: size*0.16,
          border: `1px solid ${C.dim}`, opacity: 0.25,
        }}/>
      ))}
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {dice.map((v,i) => <Die key={i} value={v} rolling={rolling} delay={i*70} size={size} glow={glow}/>)}
    </div>
  );
}

// ── Score Pill ───────────────────────────────────────────
function ScorePill({ score: val, result, big=false }) {
  if (val == null) return null;
  const color = result === "lose" ? C.red : result === "win" ? C.goldHot : C.text;
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 12 }}
      style={{
        fontFamily: mono, fontSize: big ? 36 : 18, fontWeight: 700,
        color, letterSpacing: "-0.02em",
        textShadow: result === "win" ? `0 0 16px rgba(255,204,68,0.3)` : "none",
      }}
    >{val}</motion.div>
  );
}

// ── Landing ─────────────────────────────────────────────
function Landing({ onEnter }) {
  const [dice, setDice] = useState([5,2,3,6,1,4]);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setIsRolling(true);
      setTimeout(() => { setDice(roll6()); setIsRolling(false); }, 800);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Overhead cone of light */}
      <div style={{
        position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "80vw", height: "70vh",
        background: "radial-gradient(ellipse at 50% 0%, rgba(212,151,46,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      {/* Nav */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 32px", position: "relative", zIndex: 10,
      }}>
        <div style={{
          fontFamily: display, fontSize: 20, fontWeight: 700,
          color: C.gold, letterSpacing: "0.1em",
        }}>THREES</div>
        <motion.button
          whileHover={{ backgroundColor: "rgba(212,151,46,1)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnter}
          style={{
            padding: "10px 28px", background: C.gold, color: C.bg,
            border: "none", fontFamily: body, fontWeight: 600,
            fontSize: 13, cursor: "pointer", letterSpacing: "0.02em",
          }}
        >Play Now</motion.button>
      </nav>

      {/* Hero */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px", position: "relative", zIndex: 5,
      }}>
        {/* Dice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{ marginBottom: 56 }}
        >
          <DiceTray dice={dice} rolling={isRolling} size={68}/>
        </motion.div>

        {/* Title block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ textAlign: "center" }}
        >
          <h1 style={{
            fontFamily: display, fontWeight: 700,
            fontSize: "clamp(56px, 9vw, 112px)",
            color: C.text, letterSpacing: "0.06em",
            lineHeight: 0.95, margin: 0,
          }}>
            THR<span style={{ color: C.red, opacity: 0.7 }}>3</span>ES
          </h1>
          <div style={{
            width: 48, height: 1, background: C.gold,
            margin: "24px auto", opacity: 0.4,
          }}/>
          <p style={{
            fontFamily: body, fontSize: 17, color: C.sub,
            maxWidth: 380, margin: "0 auto", lineHeight: 1.65, fontWeight: 400,
          }}>
            Six dice. Lowest score loses. Threes are worth nothing.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          style={{ marginTop: 44, display: "flex", gap: 12 }}
        >
          <motion.button
            whileHover={{ boxShadow: `0 0 32px rgba(212,151,46,0.2)` }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnter}
            style={{
              padding: "16px 48px", background: C.gold, color: C.bg,
              border: "none", fontFamily: body, fontWeight: 700,
              fontSize: 15, cursor: "pointer",
            }}
          >Enter the Table</motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{
            display: "flex", gap: 40, marginTop: 56,
            borderTop: `1px solid ${C.border}`,
            paddingTop: 32,
          }}
        >
          {[["12","TABLES"],["47","PLAYERS"],["$2.8K","IN PLAY"]].map(([v,l],i)=>(
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: mono, fontSize: 22, color: C.text, fontWeight: 600 }}>{v}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, letterSpacing: "0.18em", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Minimal footer */}
      <footer style={{
        padding: "16px 32px", textAlign: "center",
        fontFamily: mono, fontSize: 10, color: C.dim,
        letterSpacing: "0.06em",
      }}>
        18+ ONLY — GAMBLE RESPONSIBLY
      </footer>
    </div>
  );
}

// ── GAME ROOM ───────────────────────────────────────────
function Room({ onBack }) {
  const [phase, setPhase] = useState("idle"); // idle | rolling | rolled | resolved
  const [ready, setReady] = useState(false);
  const [myDice, setMyDice] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null); // { type, myScore, otherScores, profit }

  const wager = 500;
  const players = useMemo(() => [
    { id: "me", name: "You", me: true },
    { id: "p2", name: "ace_high", me: false },
    { id: "p3", name: "snake77", me: false },
    { id: "p4", name: "luckydog", me: false },
  ], []);

  // Seat angles
  const seats = useMemo(() => {
    const n = players.length;
    return players.map((_,i) => {
      const a = -90 + (360/n)*i;
      const r = a * Math.PI / 180;
      return { x: 50 + 36*Math.cos(r), y: 50 + 36*Math.sin(r) };
    });
  }, [players]);

  const handleReady = () => {
    setReady(true);
    setTimeout(() => setPhase("rolling"), 1800);
  };

  const handleRoll = () => {
    setRolling(true);
    const d = roll6();
    setTimeout(() => {
      setMyDice(d);
      setRolling(false);
      setPhase("rolled");

      // Simulate resolution
      setTimeout(() => {
        const myS = sc(d);
        const others = {};
        players.filter(p=>!p.me).forEach(p => {
          others[p.id] = { dice: roll6() };
          others[p.id].score = sc(others[p.id].dice);
        });
        const allScores = [myS, ...Object.values(others).map(o=>o.score)];
        const minS = Math.min(...allScores);
        const iLost = myS === minS;
        const losers = allScores.filter(s=>s===minS).length;
        const winnersN = players.length - losers;
        const profit = iLost ? -wager : Math.floor((wager * losers * 0.95) / winnersN);

        setResult({
          type: iLost ? "lose" : "win",
          myScore: myS,
          others,
          profit,
          pot: wager * players.length,
          rake: Math.floor(wager * losers * 0.05),
        });
        setPhase("resolved");
      }, 1600);
    }, 900);
  };

  const reset = () => {
    setPhase("idle"); setReady(false); setMyDice(null);
    setRolling(false); setResult(null);
  };

  return (
    <div style={{
      height: "100vh", background: C.bg, color: C.text,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
      fontFamily: body,
    }}>
      {/* Overhead spot */}
      <div style={{
        position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)",
        width: "60vw", height: "50vh",
        background: "radial-gradient(ellipse at 50% 0%, rgba(212,151,46,0.035) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 1,
      }}/>

      {/* Top bar — ultra minimal */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "12px 24px", position: "relative", zIndex: 20,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <motion.span
            whileHover={{ color: C.gold }}
            onClick={onBack}
            style={{ fontSize: 12, color: C.dim, cursor: "pointer", fontFamily: mono }}
          >← LOBBY</motion.span>
          <div style={{ width: 1, height: 14, background: C.border }}/>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.01em" }}>High Rollers</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 13, color: C.goldHot, fontWeight: 600 }}>
            $247.50
          </div>
          <div style={{
            fontFamily: mono, fontSize: 10, color: C.dim,
            background: C.goldMute, padding: "3px 10px", letterSpacing: "0.08em",
          }}>RND {phase === "idle" ? "—" : "1"}</div>
        </div>
      </header>

      {/* Game canvas */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", zIndex: 5, padding: "0 20px",
      }}>
        {/* ── THE TABLE ─────────────────────────────── */}
        <div style={{
          position: "relative",
          width: "min(520px, 85vw)",
          aspectRatio: "1",
        }}>
          {/* Felt */}
          <div style={{
            position: "absolute", inset: "6%", borderRadius: "50%",
            background: `
              radial-gradient(ellipse at 50% 35%, ${C.feltLight} 0%, ${C.felt} 55%, ${C.bg} 100%)
            `,
            border: `1.5px solid rgba(212,151,46,0.06)`,
            boxShadow: `
              inset 0 0 60px rgba(0,0,0,0.4),
              0 0 80px rgba(0,0,0,0.5),
              0 0 0 1px rgba(212,151,46,0.03)
            `,
          }}>
            {/* Subtle ring */}
            <div style={{
              position: "absolute", inset: "14%", borderRadius: "50%",
              border: `1px solid rgba(255,255,255,0.015)`,
            }}/>
          </div>

          {/* ── POT ──────────────────────────────────── */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)", textAlign: "center",
            zIndex: 10,
          }}>
            <div style={{
              fontFamily: mono, fontSize: 9, color: C.dim,
              letterSpacing: "0.2em", marginBottom: 6,
            }}>POT</div>
            <motion.div
              key={phase}
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                fontFamily: mono, fontSize: 28, fontWeight: 700,
                color: C.goldHot, padding: "10px 24px",
                background: "rgba(8,7,12,0.85)",
                border: `1px solid ${C.border}`,
                backdropFilter: "blur(6px)",
                letterSpacing: "-0.02em",
              }}
            >{money(wager * players.length)}</motion.div>
            <div style={{
              fontFamily: mono, fontSize: 9, color: C.dim, marginTop: 6,
              letterSpacing: "0.05em",
            }}>{players.length} × {money(wager)}</div>
          </div>

          {/* ── SEATS ────────────────────────────────── */}
          {players.map((p, i) => {
            const s = seats[i];
            const pResult = result && !p.me
              ? (result.others[p.id]?.score === Math.min(result.myScore, ...Object.values(result.others).map(o=>o.score)) ? "lose" : "win")
              : result && p.me ? result.type : null;
            const pScore = p.me ? (result?.myScore ?? (myDice ? sc(myDice) : null))
              : result?.others[p.id]?.score ?? null;

            return (
              <motion.div
                key={p.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i*0.08, type: "spring", damping: 16 }}
                style={{
                  position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, zIndex: 10,
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: `2px solid ${p.me ? C.gold : ready ? C.green : C.dim}`,
                  background: p.me ? "rgba(212,151,46,0.08)" : "rgba(255,255,255,0.02)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: mono, fontSize: 14, fontWeight: 700,
                  color: p.me ? C.gold : C.sub,
                  boxShadow: p.me ? `0 0 12px rgba(212,151,46,0.12)` : "none",
                  transition: "all 0.3s",
                }}>
                  {p.name[0].toUpperCase()}
                </div>
                <span style={{
                  fontFamily: mono, fontSize: 10, color: p.me ? C.gold : C.sub,
                  maxWidth: 72, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap",
                }}>{p.name}</span>
                {/* Score */}
                {pScore != null && (
                  <ScorePill score={pScore} result={pResult}/>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── MY DICE (below table) ────────────────── */}
        <div style={{
          marginTop: 28, minHeight: 90,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        }}>
          {phase !== "idle" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <DiceTray dice={myDice} rolling={rolling} size={58} glow={result?.type==="win"}/>
            </motion.div>
          )}
          {myDice && !result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", alignItems: "baseline", gap: 6 }}
            >
              <span style={{ fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: "0.12em" }}>SCORE</span>
              <span style={{ fontFamily: mono, fontSize: 24, fontWeight: 700, color: C.text }}>{sc(myDice)}</span>
            </motion.div>
          )}
        </div>

        {/* ── ACTION BAR ──────────────────────────── */}
        <div style={{
          marginTop: 20, minHeight: 64,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          {phase === "idle" && !ready && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: `0 0 28px rgba(212,151,46,0.2)` }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReady}
              style={{
                padding: "16px 56px", background: C.gold, color: C.bg,
                border: "none", fontFamily: body, fontWeight: 700,
                fontSize: 15, cursor: "pointer",
                letterSpacing: "0.02em",
              }}
            >Ready Up</motion.button>
          )}
          {phase === "idle" && ready && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                padding: "4px 14px", fontFamily: mono, fontSize: 10,
                background: C.greenDim, color: C.green, letterSpacing: "0.1em",
              }}>READY</div>
              <span style={{ fontFamily: body, fontSize: 12, color: C.dim }}>Waiting for others...</span>
            </motion.div>
          )}
          {phase === "rolling" && !myDice && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ boxShadow: `0 0 28px rgba(212,151,46,0.2)` }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRoll}
              style={{
                padding: "16px 56px", background: C.gold, color: C.bg,
                border: "none", fontFamily: body, fontWeight: 700,
                fontSize: 15, cursor: "pointer",
              }}
            >Roll Dice</motion.button>
          )}
          {phase === "rolled" && !result && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ fontFamily: mono, fontSize: 11, color: C.dim }}
            >Resolving...</motion.span>
          )}
        </div>
      </main>

      {/* ── RESULT OVERLAY ────────────────────────── */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: "absolute", inset: 0,
                background: result.type === "win"
                  ? "rgba(8,7,12,0.8)"
                  : "rgba(8,7,12,0.85)",
                backdropFilter: "blur(12px)",
              }}
            />

            {/* Flash */}
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute", width: 200, height: 200, borderRadius: "50%",
                background: result.type === "win"
                  ? "radial-gradient(circle, rgba(255,204,68,0.3), transparent 60%)"
                  : "radial-gradient(circle, rgba(226,59,59,0.2), transparent 60%)",
              }}
            />

            {/* Card */}
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 22, stiffness: 250, delay: 0.15 }}
              style={{
                position: "relative", zIndex: 10,
                textAlign: "center", padding: "52px 60px",
                background: C.card,
                border: `1px solid ${result.type === "win" ? C.borderHi : C.border}`,
                maxWidth: 400, width: "90%",
                boxShadow: result.type === "win"
                  ? `0 0 80px rgba(212,151,46,0.08), 0 24px 48px rgba(0,0,0,0.4)`
                  : `0 24px 48px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Verdict */}
              <motion.h2
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontFamily: display, fontWeight: 700,
                  fontSize: 32, letterSpacing: "0.08em",
                  color: result.type === "win" ? C.goldHot : C.red,
                  margin: 0,
                }}
              >{result.type === "win" ? "VICTORY" : "DEFEATED"}</motion.h2>

              {/* Divider */}
              <div style={{
                width: 32, height: 1, margin: "20px auto",
                background: result.type === "win" ? C.gold : C.red, opacity: 0.3,
              }}/>

              {/* Score */}
              <div style={{ fontFamily: mono, fontSize: 12, color: C.sub, marginBottom: 4 }}>
                YOUR SCORE
              </div>
              <div style={{
                fontFamily: mono, fontSize: 40, fontWeight: 700,
                color: result.type === "win" ? C.text : C.red,
                lineHeight: 1, marginBottom: 20,
              }}>{result.myScore}</div>

              {/* P&L */}
              <motion.div
                initial={{ scale: 0.85 }}
                animate={{ scale: [0.85, 1.06, 1] }}
                transition={{ delay: 0.5, duration: 0.4 }}
                style={{
                  fontFamily: mono, fontSize: 32, fontWeight: 700,
                  color: result.type === "win" ? C.goldHot : C.red,
                  textShadow: result.type === "win" ? `0 0 20px rgba(255,204,68,0.25)` : "none",
                }}
              >
                {result.type === "win" ? "+" : "-"}{money(Math.abs(result.profit))}
              </motion.div>

              {/* Meta */}
              <div style={{
                marginTop: 24, paddingTop: 16,
                borderTop: `1px solid ${C.border}`,
                fontFamily: mono, fontSize: 10, color: C.dim, letterSpacing: "0.04em",
              }}>
                Pot {money(result.pot)} · Rake {money(result.rake)}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28 }}>
                <motion.button
                  whileHover={{ background: C.gold }}
                  whileTap={{ scale: 0.97 }}
                  onClick={reset}
                  style={{
                    padding: "12px 32px", background: "transparent",
                    border: `1px solid ${C.borderHi}`, color: C.gold,
                    fontFamily: body, fontWeight: 600, fontSize: 13,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.target.style.color = C.bg; }}
                  onMouseLeave={e => { e.target.style.color = C.gold; e.target.style.background = "transparent"; }}
                >Play Again</motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={onBack}
                  style={{
                    padding: "12px 24px", background: "none",
                    border: "none", color: C.dim, fontFamily: body,
                    fontWeight: 500, fontSize: 13, cursor: "pointer",
                  }}
                >Leave</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("landing");
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.bg}; overflow-x: hidden; }
        ::selection { background: rgba(212,151,46,0.25); color: ${C.goldHot}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.dim}; border-radius: 2px; }
        button { transition: all 0.15s ease; }
      `}</style>
      <AnimatePresence mode="wait">
        {view === "landing" ? (
          <motion.div key="l" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <Landing onEnter={() => setView("room")}/>
          </motion.div>
        ) : (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Room onBack={() => setView("landing")}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
