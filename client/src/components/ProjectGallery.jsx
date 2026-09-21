import React, { useState, useEffect, useRef, useCallback } from "react";
import { resolveImageUrl } from "../config/api";

/* ------------------------------------------------------------------
   PROJECT GALLERY  ·  Webreve case-study page
   - Bento grid with mixed frame sizes
   - Filter chips (All / Desktop / Mobile / Details)
   - Cursor-following "View" bubble on hover
   - Lightbox with keyboard nav (← → Esc) and a filmstrip
------------------------------------------------------------------- */

const DEFAULT_ITEMS = [
  { title: "Homepage hero", cat: "Desktop", kind: "desktop", tone: "ink", c: 8, r: 4, src: "",
    note: "One headline and one booking action, visible without scrolling." },
  { title: "Booking flow", cat: "Mobile", kind: "mobile", tone: "rust", c: 4, r: 4, src: "",
    note: "Pickup, drop-off and price on a single thumb-friendly screen." },
  { title: "Shipment tracking card", cat: "Details", kind: "detail", tone: "paper", c: 4, r: 3, src: "",
    note: "Live status shown as a simple line with three stops." },
  { title: "Quote form", cat: "Details", kind: "detail", tone: "ink", c: 4, r: 3, src: "",
    note: "Five fields down to two, with the price updating as you type." },
  { title: "Order status", cat: "Mobile", kind: "mobile", tone: "paper", c: 4, r: 3, src: "",
    note: "Customers see where the vehicle is without calling anyone." },
  { title: "Operations dashboard", cat: "Desktop", kind: "desktop", tone: "paper", c: 7, r: 4, src: "",
    note: "Every active job in one table, sortable by delay." },
  { title: "Colour and type", cat: "Details", kind: "system", tone: "rust", c: 5, r: 4, src: "",
    note: "A small palette and two typefaces, used the same way on every page." },
];

const pad = (n) => String(n).padStart(2, "0");

/* ---------- placeholder wireframes (used when `src` is empty) ---------- */
function Mock({ kind }) {
  if (kind === "desktop")
    return (
      <svg className="pg-mock" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="160" height="9" fill="var(--fg)" opacity=".12" />
        <circle cx="6" cy="4.5" r="1.4" fill="var(--fg)" opacity=".5" />
        <circle cx="11" cy="4.5" r="1.4" fill="var(--fg)" opacity=".5" />
        <circle cx="16" cy="4.5" r="1.4" fill="var(--fg)" opacity=".5" />
        <rect x="52" y="3" width="56" height="3" rx="1.5" fill="var(--fg)" opacity=".2" />
        <rect x="12" y="24" width="90" height="12" fill="var(--fg)" />
        <rect x="12" y="40" width="64" height="12" fill="var(--fg)" />
        <rect x="12" y="58" width="52" height="3" fill="var(--fg)" opacity=".45" />
        <rect x="12" y="65" width="40" height="3" fill="var(--fg)" opacity=".45" />
        <rect x="12" y="76" width="34" height="10" fill="var(--ac)" />
        <rect x="112" y="20" width="36" height="66" fill="var(--fg)" opacity=".1" />
        <rect x="118" y="26" width="24" height="24" fill="var(--ac)" />
        <rect x="118" y="56" width="24" height="3" fill="var(--fg)" opacity=".5" />
        <rect x="118" y="63" width="16" height="3" fill="var(--fg)" opacity=".5" />
      </svg>
    );
  if (kind === "mobile")
    return (
      <svg className="pg-mock" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect x="30" y="6" width="40" height="88" rx="6" fill="none" stroke="var(--fg)" strokeWidth="1.2" />
        <rect x="44" y="10" width="12" height="2" rx="1" fill="var(--fg)" opacity=".4" />
        <rect x="35" y="22" width="26" height="6" fill="var(--fg)" />
        <rect x="35" y="30" width="18" height="6" fill="var(--fg)" />
        <rect x="35" y="42" width="30" height="14" fill="var(--fg)" opacity=".12" />
        <rect x="35" y="60" width="30" height="3" fill="var(--fg)" opacity=".35" />
        <rect x="35" y="66" width="22" height="3" fill="var(--fg)" opacity=".35" />
        <rect x="35" y="80" width="30" height="9" fill="var(--ac)" />
      </svg>
    );
  if (kind === "detail")
    return (
      <svg className="pg-mock" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect x="12" y="10" width="76" height="50" fill="none" stroke="var(--fg)" strokeWidth="1" />
        <rect x="18" y="16" width="22" height="6" fill="none" stroke="var(--fg)" strokeWidth=".8" opacity=".6" />
        <rect x="44" y="16" width="26" height="6" fill="none" stroke="var(--fg)" strokeWidth=".8" opacity=".6" />
        <line x1="20" y1="40" x2="80" y2="40" stroke="var(--fg)" opacity=".35" />
        <line x1="20" y1="40" x2="56" y2="40" stroke="var(--ac)" strokeWidth="2" />
        <circle cx="20" cy="40" r="3" fill="var(--fg)" />
        <circle cx="56" cy="40" r="4" fill="var(--ac)" />
        <circle cx="80" cy="40" r="3" fill="none" stroke="var(--fg)" />
        <rect x="18" y="50" width="28" height="3" fill="var(--fg)" opacity=".6" />
      </svg>
    );
  return (
    <svg className="pg-mock" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <text x="12" y="40" fontSize="36" fill="var(--fg)" style={{ fontFamily: "var(--font-display)" }}>Aa</text>
      {["#171412", "#B5432A", "#ECE7DD", "#6B645B"].map((c, i) => (
        <rect key={c} x={12 + i * 18} y="48" width="14" height="14" fill={c} stroke="var(--fg)" strokeOpacity=".35" strokeWidth=".6" />
      ))}
    </svg>
  );
}

function Art({ item, fit = "cover" }) {
  return item.src ? (
    <img src={resolveImageUrl(item.src)} alt={item.title} loading="lazy" style={{ objectFit: fit }} />
  ) : (
    <Mock kind={item.kind} />
  );
}

/* ---------- grid tile ---------- */
function Tile({ item, onOpen }) {
  const ref = useRef(null);
  const move = (e) => {
    const b = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--x", e.clientX - b.left + "px");
    ref.current.style.setProperty("--y", e.clientY - b.top + "px");
  };
  return (
    <button
      ref={ref}
      className={`pg-tile tone-${item.tone}`}
      style={{ "--c": item.c, "--r": item.r }}
      onMouseMove={move}
      onClick={onOpen}
      aria-label={`Open ${item.title}`}
    >
      <span className="pg-art"><Art item={item} /></span>
      <span className="pg-bubble" aria-hidden="true">View</span>
      <span className="pg-cap">
        <span className="pg-fig">Fig. {pad(item.fig)}</span>
        <span className="pg-ttl">{item.title}</span>
        <span className="pg-cat">{item.cat}</span>
      </span>
    </button>
  );
}

/* ---------- lightbox ---------- */
function Lightbox({ items, index, onClose, onGo }) {
  const item = items[index];
  const closeRef = useRef(null);

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onGo((index + 1) % items.length);
      if (e.key === "ArrowLeft") onGo((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onGo]);

  return (
    <div className="pg-lb" role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="pg-lb-top">
        <span className="pg-lb-count">{pad(index + 1)} / {pad(items.length)}</span>
        <span className="pg-lb-title">{item.title}</span>
        <button ref={closeRef} className="pg-lb-close" onClick={onClose}>Close</button>
      </div>

      <div className="pg-lb-main">
        <button className="pg-lb-nav" onClick={() => onGo((index - 1 + items.length) % items.length)} aria-label="Previous">←</button>
        <div key={item.fig} className={`pg-stage tone-${item.tone}`}>
          <Art item={item} fit="contain" />
        </div>
        <button className="pg-lb-nav" onClick={() => onGo((index + 1) % items.length)} aria-label="Next">→</button>
      </div>

      <div className="pg-lb-bottom">
        <p className="pg-lb-note">{item.note}</p>
        <div className="pg-strip" role="tablist" aria-label="All screens">
          {items.map((it, i) => (
            <button
              key={it.fig}
              role="tab"
              aria-selected={i === index}
              aria-label={it.title}
              className={`pg-thumb tone-${it.tone} ${i === index ? "on" : ""}`}
              onClick={() => onGo(i)}
            >
              <Art item={it} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */
export default function ProjectGallery({
  project = null,
  items = null,
  label = "03 / The visual record",
  title = "Screens from the build",
  intro = "Select any frame to see it full size.",
}) {
  // If project is provided, prioritize project.galleryItems, or construct fallback
  const galleryItems = items || (project?.galleryItems && project.galleryItems.length > 0 ? project.galleryItems : project ? [
    {
      id: "f-1",
      title: `${project.title} · Platform Overview`,
      cat: "Desktop",
      kind: "desktop",
      tone: "ink",
      c: 8,
      r: 4,
      src: project.image || "",
      note: project.tagline || "One headline and one clear booking action, visible without scrolling."
    },
    {
      id: "f-2",
      title: "Mobile responsive flow",
      cat: "Mobile",
      kind: "mobile",
      tone: "rust",
      c: 4,
      r: 4,
      src: project.mockups?.[1] || "",
      note: "Streamlined input and instant pricing on a single thumb-friendly screen."
    },
    {
      id: "f-3",
      title: "Real-time tracking & state card",
      cat: "Details",
      kind: "detail",
      tone: "paper",
      c: 4,
      r: 3,
      src: project.mockups?.[2] || "",
      note: "Live status displayed through high-velocity status pipelines."
    },
    {
      id: "f-4",
      title: "Interactive quote calculator",
      cat: "Details",
      kind: "detail",
      tone: "ink",
      c: 4,
      r: 3,
      src: "",
      note: "Simplified multi-step calculations with dynamic real-time price updates."
    },
    {
      id: "f-5",
      title: "Customer dispatch status",
      cat: "Mobile",
      kind: "mobile",
      tone: "paper",
      c: 4,
      r: 3,
      src: "",
      note: "Self-service client transparency without support overhead."
    },
    {
      id: "f-6",
      title: "Operations management console",
      cat: "Desktop",
      kind: "desktop",
      tone: "paper",
      c: 7,
      r: 4,
      src: "",
      note: "High-density active monitoring console, sortable by priority."
    },
    {
      id: "f-7",
      title: "Design tokens & type system",
      cat: "Details",
      kind: "system",
      tone: "rust",
      c: 5,
      r: 4,
      src: "",
      note: "Editorial color palette and typographic hierarchy applied consistently."
    },
  ] : DEFAULT_ITEMS);

  const all = galleryItems.map((it, i) => ({ ...it, fig: i + 1 }));
  const cats = ["All", ...new Set(all.map((i) => i.cat || "Details"))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);

  const filtered = cat === "All" ? all : all.filter((i) => (i.cat || "Details") === cat);
  // In a filtered view the mixed sizes are replaced by an even row so there are no gaps
  const visible =
    cat === "All"
      ? filtered
      : filtered.map((i) => ({ ...i, c: filtered.length === 1 ? 12 : filtered.length === 2 ? 6 : 4, r: 4 }));

  const close = useCallback(() => setOpen(null), [setOpen]);

  return (
    <section className="pg clear-both block w-full relative z-10">
      <style>{CSS}</style>
      <div className="pg-wrap max-w-7xl mx-auto px-6 md:px-12">
        <header className="pg-head">
          <div>
            <p className="pg-label"><i /> {label}</p>
            <h2 className="pg-title">{title}</h2>
            <p className="pg-intro">{intro}</p>
          </div>

          <div className="pg-filters" role="group" aria-label="Filter screens">
            {cats.map((c) => (
              <button
                key={c}
                className={`pg-chip ${c === cat ? "on" : ""}`}
                aria-pressed={c === cat}
                onClick={() => setCat(c)}
              >
                {c}
                <span>{c === "All" ? all.length : all.filter((i) => (i.cat || "Details") === c).length}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="pg-grid">
          {visible.map((it, i) => (
            <Tile key={it.id || it.fig} item={it} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>

      {open !== null && <Lightbox items={visible} index={open} onClose={close} onGo={setOpen} />}
    </section>
  );
}

/* ---------- scoped styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Space+Mono:wght@400;700&family=Newsreader:opsz,wght@6..72,400&display=swap');

.pg {
  --paper: #F0EBE1;
  --paper-2: #E8E2D7;
  --ink: #1A1512;
  --rust: #C1512F;
  --mute: #6B645B;
  --line: rgba(26, 21, 18, 0.15);
  --font-display: "Anton", "Bebas Neue", Impact, "Arial Narrow", sans-serif;
  --font-mono: "Space Mono", ui-monospace, Menlo, monospace;
  --font-serif: "Newsreader", Georgia, serif;

  background: var(--paper);
  color: var(--ink);
  padding: 80px 0 96px;
  box-sizing: border-box;
  border-top: 1px solid var(--line);
}
.pg *, .pg *::before, .pg *::after { box-sizing: border-box; }
.pg-wrap { max-width: 1280px; margin: 0 auto; padding: 0 24px; width: 100%; }
@media (min-width: 768px) {
  .pg-wrap { padding: 0 48px; }
}

/* colour tones for frames */
.pg .tone-ink   { --bg: #1A1512; --fg: #F0EBE1; --ac: #C1512F; }
.pg .tone-rust  { --bg: #C1512F; --fg: #F0EBE1; --ac: #1A1512; }
.pg .tone-paper { --bg: #E8E2D7; --fg: #1A1512; --ac: #C1512F; }

/* header */
.pg-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 32px; flex-wrap: wrap; margin-bottom: 40px;
}
.pg-label {
  display: flex; align-items: center; gap: 10px; margin: 0 0 14px;
  font: 700 12px/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase; color: var(--rust);
}
.pg-label i { width: 9px; height: 9px; background: var(--rust); display: block; }
.pg-title {
  margin: 0; font: 400 clamp(36px, 5vw, 56px)/.95 var(--font-display);
  text-transform: uppercase; letter-spacing: -.005em;
}
.pg-intro { margin: 14px 0 0; font: 400 18px/1.5 var(--font-serif); color: var(--mute); }

/* filter chips */
.pg-filters { display: flex; gap: 8px; flex-wrap: wrap; }
.pg-chip {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
  padding: 9px 14px; background: transparent; color: var(--ink);
  border: 1px solid var(--line);
  font: 700 11px/1 var(--font-mono); letter-spacing: .12em; text-transform: uppercase;
  transition: background .18s, color .18s, border-color .18s;
}
.pg-chip span { color: var(--mute); font-weight: 400; }
.pg-chip:hover { border-color: var(--ink); }
.pg-chip.on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
.pg-chip.on span { color: var(--rust); }
.pg-chip:focus-visible, .pg-tile:focus-visible, .pg-lb button:focus-visible { outline: 2px solid var(--rust); outline-offset: 3px; }

/* bento grid */
.pg-grid {
  display: grid; grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 96px; grid-auto-flow: dense; gap: 14px;
}
.pg-tile {
  position: relative; overflow: hidden; padding: 0; cursor: pointer;
  grid-column: span var(--c); grid-row: span var(--r);
  background: var(--bg); color: var(--fg);
  border: 1px solid var(--ink);
  text-align: left; font: inherit;
}
.pg-art { position: absolute; inset: 0 0 38px 0; display: block; overflow: hidden; }
.pg-art img, .pg-mock { width: 100%; height: 100%; display: block; }
.pg-art img { transition: transform .5s cubic-bezier(.2,.7,.2,1); object-fit: cover; }
.pg-mock { transition: transform .5s cubic-bezier(.2,.7,.2,1); }

/* caption strip */
.pg-cap {
  position: absolute; left: 0; right: 0; bottom: 0; height: 38px;
  display: flex; align-items: center; gap: 12px; padding: 0 14px;
  background: var(--paper); color: var(--ink);
  border-top: 1px solid var(--ink);
  font: 400 11px/1 var(--font-mono); letter-spacing: .12em; text-transform: uppercase;
}
.pg-cap .pg-fig { color: var(--rust); white-space: nowrap; font-weight: 700; }
.pg-cap .pg-ttl { flex: 1; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pg-cap .pg-cat { color: var(--mute); white-space: nowrap; }

/* cursor-following bubble */
.pg-bubble {
  position: absolute; left: var(--x, 50%); top: var(--y, 50%);
  width: 68px; height: 68px; border-radius: 50%;
  display: grid; place-items: center; pointer-events: none;
  background: var(--ac); color: var(--paper);
  font: 700 11px/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase;
  transform: translate(-50%, -50%) scale(.4); opacity: 0;
  transition: transform .2s ease, opacity .2s ease;
  z-index: 10;
}
@media (hover: hover) {
  .pg-tile:hover .pg-bubble { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  .pg-tile:hover .pg-art img, .pg-tile:hover .pg-mock { transform: scale(1.03); }
}

/* lightbox */
.pg-lb {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(23, 20, 18, .97); color: var(--paper);
  display: flex; flex-direction: column; padding: 20px 28px 24px; gap: 18px;
  animation: pg-lb-in .22s ease;
}
@keyframes pg-lb-in { from { opacity: 0; } to { opacity: 1; } }
.pg-lb-top { display: flex; align-items: center; gap: 20px; font: 400 12px/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase; }
.pg-lb-count { color: var(--rust); font-weight: 700; }
.pg-lb-title { flex: 1; font-weight: 700; }
.pg-lb-close {
  background: var(--paper); color: var(--ink); border: 0; cursor: pointer;
  padding: 11px 16px; font: 700 12px/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase;
  transition: background .18s, color .18s;
}
.pg-lb-close:hover { background: var(--rust); color: var(--paper); }
.pg-lb-main { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; gap: 20px; }
.pg-lb-nav {
  flex: none; width: 48px; height: 48px; cursor: pointer;
  background: transparent; color: var(--paper); border: 1px solid rgba(236, 231, 221, .3);
  font: 400 20px/1 var(--font-mono); transition: background .18s, border-color .18s;
}
.pg-lb-nav:hover { background: var(--rust); border-color: var(--rust); }
.pg-stage {
  position: relative; background: var(--bg); border: 1px solid rgba(236, 231, 221, .25);
  aspect-ratio: 16 / 10; height: 100%; max-height: 100%; max-width: 100%;
  animation: pg-lb-swap .25s ease;
}
@keyframes pg-lb-swap { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.pg-stage img, .pg-stage .pg-mock { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
.pg-lb-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.pg-lb-note { margin: 0; max-width: 46ch; font: 400 18px/1.5 var(--font-serif); color: rgba(236, 231, 221, .8); }
.pg-strip { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; }
.pg-thumb {
  width: 64px; height: 42px; padding: 0; cursor: pointer; position: relative; overflow: hidden;
  background: var(--bg); border: 1px solid rgba(236, 231, 221, .25); opacity: .5;
  transition: opacity .18s, border-color .18s; flex-shrink: 0;
}
.pg-thumb:hover { opacity: .85; }
.pg-thumb.on { opacity: 1; border-color: var(--rust); }
.pg-thumb img, .pg-thumb .pg-mock { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }

/* small screens */
@media (max-width: 760px) {
  .pg { padding: 56px 0; }
  .pg-grid { grid-auto-rows: 72px; }
  .pg-tile { grid-column: span 12; grid-row: span 4; }
  .pg-lb { padding: 14px; }
  .pg-lb-nav { display: none; }
  .pg-stage { height: auto; width: 100%; }
  .pg-thumb { width: 48px; height: 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .pg *, .pg-lb, .pg-lb * { animation: none !important; transition: none !important; }
}
`;
