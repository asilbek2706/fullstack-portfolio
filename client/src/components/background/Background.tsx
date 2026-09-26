import { useId } from 'react';
import './Background.scss';
const columns = Array.from({ length: 21 }, (_, i) => (i - 10) * 65);
const rows = [
  0, 70, 140, 210, 280, 345, 400, 444, 478, 506, 530, 554, 585, 628, 685, 765,
  880,
];
export function Background() {
  const id = useId().replace(/:/g, '');
  return (
    <div className="portfolio-background" aria-hidden="true">
      <svg
        viewBox="0 0 1200 880"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <defs>
          <radialGradient id={`${id}-light`} cx="50%" cy="72%" r="65%">
            <stop offset="0" stopColor="var(--grid-color)" stopOpacity=".2" />
            <stop offset="1" stopColor="var(--grid-color)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--grid-color)" stopOpacity=".1" />
            <stop offset=".5" stopColor="var(--grid-color)" stopOpacity=".22" />
            <stop offset=".72" stopColor="var(--grid-color)" stopOpacity=".8" />
            <stop offset="1" stopColor="var(--grid-color)" stopOpacity=".35" />
          </linearGradient>
        </defs>
        <rect width="1200" height="880" fill={`url(#${id}-light)`} />
        <g
          className="portfolio-background__lines"
          stroke={`url(#${id}-stroke)`}
          fill="none"
          strokeWidth="1"
        >
          {columns.map((d) => (
            <path
              key={d}
              d={`M ${600 + d} -50 L ${600 + d} 280 C ${600 + d} 480 ${600 + d * 1.05} 490 ${600 + d * 1.55} 560 L ${600 + d * 4.5} 980`}
            />
          ))}
          {rows.map((y) => (
            <path key={y} d={`M -100 ${y} H 1300`} />
          ))}
        </g>
      </svg>
      <div className="portfolio-background__shade" />
    </div>
  );
}
