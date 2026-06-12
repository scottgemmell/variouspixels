import { useEffect, useRef, useState } from 'react'

const CELL = 30

// Hidden conic gradient stops: warm reds/terracottas/oranges/ambers for ~290°,
// midnight blue confined to one narrow direction. No greens/purples (client decision).
const GRAD_STOPS = [
  [0, '#d62828'],
  [70, '#c0653f'],
  [140, '#e8742c'],
  [215, '#eda118'],
  [250, '#eda118'],
  [270, '#1c2752'],
  [300, '#1c2752'],
  [320, '#d62828'],
  [360, '#d62828'],
]

// Snap a position to the 30px lattice; −1 so the edge coincides with the 1px hairline.
const snap = (v) => Math.max(29, Math.round(v / CELL) * CELL - 1)

// Snap a size so the far border also lands on a hairline: with the near edge at
// n*30−1, the size must be a multiple of 30 plus 1 for the far edge to reach m*30.
const snapSize = (v) => Math.max(CELL + 1, Math.round(v / CELL) * CELL + 1)

const mixHex = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (sh) =>
    Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * t)
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`
}

// Sample the hidden conic gradient at a cell's center.
const sampleGradient = (c, r, w, h) => {
  const x = (c + 0.5) * CELL
  const y = (r + 0.5) * CELL
  const cx = w * 0.6
  const cy = h * 0.65
  let ang = (Math.atan2(x - cx, cy - y) * 180) / Math.PI
  if (ang < 0) ang += 360
  for (let i = 0; i < GRAD_STOPS.length - 1; i++) {
    const [a0, col0] = GRAD_STOPS[i]
    const [a1, col1] = GRAD_STOPS[i + 1]
    if (ang >= a0 && ang <= a1) return mixHex(col0, col1, (ang - a0) / (a1 - a0))
  }
  return GRAD_STOPS[0][1]
}

const EMAIL = 'variouspixels' + String.fromCharCode(64) + 'gmail.com'

// href null marks the version this site is — rendered as a static label, not a link
const VERSIONS = [
  ['v1', 'https://v1.variouspixels.com'],
  ['v2', null],
]

export default function App() {
  const [lit, setLit] = useState({})
  const [{ w, h }, setSize] = useState({
    w: window.innerWidth,
    h: window.innerHeight,
  })
  const timers = useRef({})

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const t = timers.current
    return () => Object.values(t).forEach(clearTimeout)
  }, [])

  const light = (key, color) => {
    setLit((s) => ({ ...s, [key]: color }))
    clearTimeout(timers.current[key])
    timers.current[key] = setTimeout(() => {
      setLit((s) => {
        const next = { ...s }
        delete next[key]
        return next
      })
    }, 650)
  }

  const cols = Math.ceil(w / CELL)
  const rows = Math.ceil(h / CELL)

  const wordmarkSize = Math.max(40, Math.min(84, Math.round(w * 0.045)))
  const emailSize = wordmarkSize > 60 ? 16 : 13
  const box = {
    left: snap(w * 0.08),
    top: snap(h * 0.16),
    width: snapSize(wordmarkSize * 11.6 + 60),
    height: snapSize(wordmarkSize * 2.1),
  }
  const versionsTop = (Math.floor(h / CELL) - 2) * CELL

  return (
    <div className="fixed inset-0 overflow-hidden bg-gold cursor-crosshair">
      {/* 1px hairlines inside each 30px cell at its right and bottom edge */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, transparent 0px, transparent 29px, rgba(26,26,26,0.10) 29px, rgba(26,26,26,0.10) 30px),' +
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 29px, rgba(26,26,26,0.10) 29px, rgba(26,26,26,0.10) 30px)',
        }}
      />

      {/* Cursor trail layer */}
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
        }}
      >
        {Array.from({ length: cols * rows }, (_, i) => {
          const key = `t:${i}`
          const color = lit[key]
          return (
            <div
              key={i}
              onMouseEnter={() => light(key, sampleGradient(i % cols, Math.floor(i / cols), w, h))}
              style={{
                background: color || 'transparent',
                transition: color ? 'background 50ms' : 'background 1100ms ease-out',
              }}
            />
          )
        })}
      </div>

      {/* Wordmark box — every edge snapped to the lattice */}
      <div
        className="absolute box-border flex flex-col justify-center gap-[10px] bg-gold pl-cell pointer-events-none border border-[rgba(26,26,26,0.16)]"
        style={box}
      >
        <h1
          className="m-0 whitespace-nowrap font-silkscreen font-bold text-ink"
          style={{ fontSize: wordmarkSize, wordSpacing: '-0.3em' }}
        >
          various pixels
        </h1>
        <a
          href={`mailto:${EMAIL}`}
          className="w-fit font-mono no-underline pointer-events-auto text-[rgba(26,26,26,0.65)] hover:text-ink"
          style={{ fontSize: emailSize }}
        >
          {EMAIL}
        </a>
      </div>

      {/* Version links — 30×30 lattice cells, two rows above the bottom */}
      <div className="absolute flex left-cell" style={{ top: versionsTop }}>
        {VERSIONS.map(([label, href]) =>
          href ? (
            <a
              key={label}
              href={href}
              className="box-border flex size-cell items-center justify-center font-mono text-[11px] no-underline text-[rgba(26,26,26,0.4)] border-2 border-transparent hover:text-ink hover:font-bold hover:border-ink hover:bg-[rgba(26,26,26,0.07)]"
            >
              {label}
            </a>
          ) : (
            <span
              key={label}
              className="box-border flex size-cell items-center justify-center font-mono text-[11px] font-bold text-ink border-2 border-transparent"
            >
              {label}
            </span>
          ),
        )}
      </div>
    </div>
  )
}
