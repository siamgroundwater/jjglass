import type { CSSProperties } from 'react';
const paths = {
  arrow: 'M4 12h15m-6-6 6 6-6 6',
  bag: 'M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  search: 'm21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  menu: 'M3 6h18M3 12h18M3 18h18',
  close: 'm6 6 12 12M6 18 18 6',
  minus: 'M5 12h14',
  plus: 'M5 12h14M12 5v14',
  check: 'm5 12 4 4L19 6',
  truck: 'M1 4h14v13H1V4Zm14 5h4l4 5v3h-8M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4Zm-4 10 3 3 5-6',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  chevron: 'm8 5 7 7-7 7',
  grid: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  phone: 'M5 3h4l2 5-3 2c1 3 3 5 6 6l2-3 5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 5a2 2 0 0 1 2-2Z',
  mail: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
  book: 'M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-1-1-6-2-10 1Zm0 0v16',
  leaf: 'M21 3c-9-1-17 1-17 9a7 7 0 0 0 7 7c8 0 10-7 10-16ZM3 22 16 9',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  filter: 'M4 6h16M7 12h10M10 18h4',
  trash: 'M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6'
};
export type IconName = keyof typeof paths;
export default function Icon({
  name,
  size = 22,
  style,
  className
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
    <path d={paths[name]} />
  </svg>;
}
