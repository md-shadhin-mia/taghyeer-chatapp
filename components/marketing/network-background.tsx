/**
 * Barely-visible network of connected points behind the hero, evoking
 * realtime infrastructure rather than a decorative pattern. Pure SVG + CSS
 * (`offset-path`)-no canvas, no per-frame JS. Node/edge coordinates are
 * hardcoded (not randomized) so server and client markup always match.
 */
const NODES: [number, number][] = [
  [60, 70],
  [230, 30],
  [400, 100],
  [580, 40],
  [740, 90],
  [110, 210],
  [280, 250],
  [450, 300],
  [630, 240],
  [760, 310],
  [190, 330],
  [510, 170],
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [2, 11],
  [11, 8],
  [5, 10],
  [10, 6],
];

/** Edge indices the traveling signal dots ride, staggered so they don't sync. */
const SIGNAL_EDGES = [1, 4, 9];

export function NetworkBackground() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
    >
      <g stroke="var(--border-subtle)" strokeWidth="1" opacity="0.6">
        {EDGES.map(([a, b], i) => {
          const [x1, y1] = NODES[a];
          const [x2, y2] = NODES[b];
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <g fill="var(--muted-dim)">
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.5 : 1.6} opacity="0.5" />
        ))}
      </g>
      {SIGNAL_EDGES.map((edgeIndex, i) => {
        const [a, b] = EDGES[edgeIndex];
        const [x1, y1] = NODES[a];
        const [x2, y2] = NODES[b];
        return (
          <circle
            key={edgeIndex}
            r="2.5"
            fill="var(--accent-to)"
            className="animate-network-signal"
            style={{
              offsetPath: `path("M${x1},${y1} L${x2},${y2}")`,
              animationDelay: `${i * 1.3}s`,
            }}
          />
        );
      })}
    </svg>
  );
}
