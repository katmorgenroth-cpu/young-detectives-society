/** Shared look and feel. Sizes are in the 1280x720 design space. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const colors = {
  ink: 0x1d1611,
  paper: 0xf4e9d8,
  paperDark: 0xe2d2b6,
  panel: 0x2a1f19,
  panelEdge: 0xc9a25b,
  gold: 0xc9a25b,
  focus: 0xffd166,
  hover: 0xfff1c1,
  button: 0x5a3d2b,
  buttonHover: 0x76523a,
  buttonPressed: 0x3f2a1d,
  buttonDisabled: 0x4a4440,
  good: 0x5c8a4a,
  attention: 0xb5523b,
} as const;

/** CSS colour strings for Phaser text. */
export const textColors = {
  light: '#f4e9d8',
  dark: '#1d1611',
  gold: '#e6c27a',
  muted: '#b8a68a',
  mutedDark: '#5a4a3a',
  disabled: '#9a918a',
} as const;

/** Body text uses a plain, highly readable face; titles use a serif. */
export const fonts = {
  body: '"Trebuchet MS", "Segoe UI", Verdana, sans-serif',
  title: 'Georgia, "Times New Roman", serif',
} as const;

export const sizes = {
  body: 24,
  small: 20,
  heading: 30,
  /** Minimum height for any touch target. */
  touchTarget: 56,
} as const;

export const depth = {
  room: 0,
  hotspots: 10,
  characters: 20,
  hud: 100,
  dialogue: 200,
  journal: 300,
  toast: 400,
} as const;
