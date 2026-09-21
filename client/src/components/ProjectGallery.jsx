import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { resolveImageUrl } from "../config/api";
import { useModalRegistration } from "../context/ModalContext";

/* ------------------------------------------------------------------
   PROJECT GALLERY  ·  WebRêve case-study page
   - Bento grid with real uploaded images (no fake wireframe SVGs)
   - Filter chips (All / Desktop / Mobile / Details)
   - Cursor-following "VIEW" bubble on hover
   - Lightbox with portal mounting, visible Close button, backdrop close, and Esc
------------------------------------------------------------------- */

const pad = (n) => String(n).padStart(2, "0");

function Art({ item, fit = "cover" }) {
  if (!item?.src) return null;
  return (
    <img
      src={resolveImageUrl(item.src)}
      alt={item.title || "Showcase screen"}
      loading="lazy"
      style={{ objectFit: fit }}
      onError={(e) => {
        // Hide broken image placeholder
        e.currentTarget.style.opacity = '0';
      }}
    />
  );
}

/* ---------- grid tile ---------- */
function Tile({ item, onOpen }) {
  const ref = useRef(null);
  const move = (e) => {
    if (!ref.current) return;
    const b = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--x", e.clientX - b.left + "px");
    ref.current.style.setProperty("--y", e.clientY - b.top + "px");
  };

  return (
    <button
      ref={ref}
      className={`pg-tile tone-${item.tone || 'ink'}`}
      style={{ "--c": item.c || 6, "--r": item.r || 4 }}
      onMouseMove={move}
      onClick={onOpen}
      aria-label={`Open ${item.title}`}
    >
      <span className="pg-art"><Art item={item} /></span>
      <span className="pg-bubble" aria-hidden="true">VIEW</span>
      <span className="pg-cap">
        <span className="pg-fig">FIG. {pad(item.fig)}</span>
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

  // Register with ModalContext for Android hardware back button
  useModalRegistration(true, onClose, 'gallery-lightbox-modal');

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

  if (!item) return null;

  return (
    <div
      className="pg-lb"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => {
        // Exit preview when clicking background outside the stage or nav
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Header Bar */}
      <div className="pg-lb-top">
        <div className="flex items-center gap-3">
          <span className="pg-lb-count">{pad(index + 1)} / {pad(items.length)}</span>
          <span className="text-[10px] text-[#C1512F] uppercase font-bold tracking-wider px-2 py-0.5 border border-[#C1512F]/30 bg-[#C1512F]/10">
            {item.cat || 'SHOWCASE'}
          </span>
        </div>
        <span className="pg-lb-title truncate max-w-md hidden sm:inline">{item.title}</span>

        {/* High-visibility Close Button with icon and keyboard hint */}
        <button
          ref={closeRef}
          className="pg-lb-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="w-4 h-4" />
          <span>CLOSE PREVIEW</span>
          <span className="text-[9px] opacity-70 hidden md:inline">[ESC]</span>
        </button>
      </div>

      {/* Main Preview Stage */}
      <div
        className="pg-lb-main"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {items.length > 1 && (
          <button
            className="pg-lb-nav"
            onClick={(e) => {
              e.stopPropagation();
              onGo((index - 1 + items.length) % items.length);
            }}
            aria-label="Previous image"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div key={item.id || item.fig || index} className={`pg-stage tone-${item.tone || 'ink'}`}>
          <Art item={item} fit="contain" />
        </div>

        {items.length > 1 && (
          <button
            className="pg-lb-nav"
            onClick={(e) => {
              e.stopPropagation();
              onGo((index + 1) % items.length);
            }}
            aria-label="Next image"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom bar with note and filmstrip */}
      <div className="pg-lb-bottom">
        <div className="space-y-1 max-w-xl">
          <div className="font-mono text-xs font-bold text-white uppercase">{item.title}</div>
          {item.note && <p className="pg-lb-note">{item.note}</p>}
        </div>

        {items.length > 1 && (
          <div className="pg-strip" role="tablist" aria-label="All screens">
            {items.map((it, i) => (
              <button
                key={it.id || it.fig || i}
                role="tab"
                aria-selected={i === index}
                aria-label={it.title}
                className={`pg-thumb tone-${it.tone || 'ink'} ${i === index ? "on" : ""}`}
                onClick={() => onGo(i)}
              >
                <Art item={it} />
              </button>
            ))}
          </div>
        )}
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
  const [open, setOpen] = useState(null);
  const [cat, setCat] = useState("All");

  // Collect ONLY real images that have actually been uploaded or added
  const realImages = [];

  // Helper to check if an image is real and not a default placeholder
  const isRealImage = (src) => {
    if (!src || typeof src !== 'string') return false;
    const trimmed = src.trim();
    return trimmed.length > 0 && !trimmed.includes('photo-1618005182384-a83a8bd57fbe');
  };

  // 1. If explicit items prop passed with valid real image src:
  if (Array.isArray(items)) {
    items.forEach((it, idx) => {
      if (isRealImage(it?.src)) {
        realImages.push({
          id: it.id || `item-${idx + 1}`,
          title: it.title || `Screen ${idx + 1}`,
          cat: it.cat || 'Desktop',
          tone: it.tone || 'ink',
          c: Number(it.c) || 6,
          r: Number(it.r) || 4,
          src: it.src.trim(),
          note: it.note || ''
        });
      }
    });
  }

  // 2. Project galleryItems if added
  if (Array.isArray(project?.galleryItems)) {
    project.galleryItems.forEach((it, idx) => {
      if (isRealImage(it?.src) && !realImages.some(r => r.src === it.src.trim())) {
        realImages.push({
          id: it.id || `gal-${idx + 1}`,
          title: it.title || `${project.title || 'Screen'} ${idx + 1}`,
          cat: it.cat || 'Desktop',
          tone: it.tone || (idx % 2 === 0 ? 'ink' : 'rust'),
          c: Number(it.c) || 6,
          r: Number(it.r) || 4,
          src: it.src.trim(),
          note: it.note || project.tagline || ''
        });
      }
    });
  }

  // 3. Fallback to project.image ONLY if it is a real uploaded image (no mockups, no placeholders)
  if (realImages.length === 0 && isRealImage(project?.image)) {
    realImages.push({
      id: 'main-cover-preview',
      title: `${project.title} · Platform Overview`,
      cat: 'Desktop',
      tone: 'ink',
      c: 12,
      r: 5,
      src: project.image.trim(),
      note: project.tagline || `${project.title} digital platform build.`
    });
  }

  // If no images have been added at all, do not render default wireframe mockups
  if (realImages.length === 0) {
    return null;
  }

  // Layout assignment for Bento tiles
  const formatted = realImages.map((it, idx) => {
    let c = it.c || 6;
    let r = it.r || 4;
    if (realImages.length === 1) {
      c = 12;
      r = 5;
    } else if (realImages.length === 2) {
      c = 6;
      r = 4;
    } else if (realImages.length === 3) {
      if (idx === 0) { c = 8; r = 4; }
      else if (idx === 1) { c = 4; r = 4; }
      else { c = 12; r = 4; }
    }
    return { ...it, c, r, fig: idx + 1 };
  });

  const categories = ["All", ...new Set(formatted.map((i) => i.cat || "Desktop"))];
  const filtered = cat === "All" ? formatted : formatted.filter((i) => (i.cat || "Desktop") === cat);
  const visible =
    cat === "All"
      ? filtered
      : filtered.map((i) => ({ ...i, c: filtered.length === 1 ? 12 : filtered.length === 2 ? 6 : 4, r: 4 }));

  const close = useCallback(() => setOpen(null), []);

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

          {categories.length > 2 && (
            <div className="pg-filters" role="group" aria-label="Filter screens">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`pg-chip ${c === cat ? "on" : ""}`}
                  aria-pressed={c === cat}
                  onClick={() => setCat(c)}
                >
                  {c}
                  <span>{c === "All" ? formatted.length : formatted.filter((i) => (i.cat || "Desktop") === c).length}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="pg-grid">
          {visible.map((it, i) => (
            <Tile key={it.id || it.fig || i} item={it} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>

      {/* Render Lightbox modal through React Portal directly to document.body */}
      {open !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <Lightbox items={visible} index={open} onClose={close} onGo={setOpen} />,
          document.body
        )}
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
  grid-auto-rows: 100px; grid-auto-flow: dense; gap: 14px;
}
.pg-tile {
  position: relative; overflow: hidden; padding: 0; cursor: pointer;
  grid-column: span var(--c); grid-row: span var(--r);
  background: var(--bg); color: var(--fg);
  border: 1px solid var(--ink);
  text-align: left; font: inherit;
}
.pg-art { position: absolute; inset: 0 0 38px 0; display: block; overflow: hidden; background: rgba(26, 21, 18, 0.05); }
.pg-art img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .5s cubic-bezier(.2,.7,.2,1); }

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
  .pg-tile:hover .pg-art img { transform: scale(1.03); }
}

/* lightbox overlay (mounted at document root via portal) */
.pg-lb {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(18, 14, 12, 0.98); color: var(--paper);
  display: flex; flex-direction: column; padding: 20px 28px 24px; gap: 16px;
  animation: pg-lb-in .2s ease;
  backdrop-filter: blur(16px);
}
@keyframes pg-lb-in { from { opacity: 0; transform: scale(.99); } to { opacity: 1; transform: scale(1); } }
.pg-lb-top {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  font: 700 12px/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase;
  border-bottom: 1px solid rgba(236, 231, 221, 0.12);
  padding-bottom: 12px;
}
.pg-lb-count { color: var(--rust); font-weight: 700; font-size: 13px; }
.pg-lb-title { font-weight: 700; letter-spacing: .08em; }
.pg-lb-close {
  background: var(--rust); color: #FFFFFF; border: 1px solid var(--rust); cursor: pointer;
  padding: 10px 18px; font: 700 11px/1 var(--font-mono); letter-spacing: .14em; text-transform: uppercase;
  transition: all .18s; display: inline-flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 14px rgba(193, 81, 47, 0.4);
}
.pg-lb-close:hover { background: #FFFFFF; color: #1A1512; border-color: #FFFFFF; }
.pg-lb-main { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; gap: 20px; position: relative; }
.pg-lb-nav {
  flex: none; width: 50px; height: 50px; cursor: pointer; border-radius: 0;
  background: rgba(26, 21, 18, 0.7); color: var(--paper); border: 1px solid rgba(236, 231, 221, .3);
  display: flex; align-items: center; justify-content: center;
  transition: background .18s, border-color .18s, color .18s;
  z-index: 10;
}
.pg-lb-nav:hover { background: var(--rust); border-color: var(--rust); color: #FFFFFF; }
.pg-stage {
  position: relative; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(236, 231, 221, .2);
  aspect-ratio: 16 / 10; height: 100%; max-height: 100%; max-width: 100%;
  animation: pg-lb-swap .2s ease; display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
@keyframes pg-lb-swap { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.pg-stage img { width: 100%; height: 100%; object-fit: contain; }
.pg-lb-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.pg-lb-note { margin: 0; font: 400 15px/1.5 var(--font-serif); color: rgba(236, 231, 221, .85); }
.pg-strip { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding-bottom: 4px; }
.pg-thumb {
  width: 68px; height: 44px; padding: 0; cursor: pointer; position: relative; overflow: hidden;
  background: var(--bg); border: 1px solid rgba(236, 231, 221, .25); opacity: .5;
  transition: opacity .18s, border-color .18s, transform .15s; flex-shrink: 0;
}
.pg-thumb:hover { opacity: .9; transform: scale(1.04); }
.pg-thumb.on { opacity: 1; border-color: var(--rust); box-shadow: 0 0 0 1px var(--rust); }
.pg-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* small screens */
@media (max-width: 760px) {
  .pg { padding: 56px 0; }
  .pg-grid { grid-auto-rows: 72px; }
  .pg-tile { grid-column: span 12; grid-row: span 4; }
  .pg-lb { padding: 14px 12px; }
  .pg-lb-top { padding-bottom: 10px; }
  .pg-lb-close { padding: 8px 12px; font-size: 11px; }
  .pg-lb-nav { display: none; }
  .pg-stage { height: auto; width: 100%; }
  .pg-thumb { width: 48px; height: 32px; }
}

@media (prefers-reduced-motion: reduce) {
  .pg *, .pg-lb, .pg-lb * { animation: none !important; transition: none !important; }
}
`;
