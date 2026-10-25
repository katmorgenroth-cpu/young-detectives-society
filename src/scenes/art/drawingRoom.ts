import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../../ui/theme';

/**
 * Placeholder artwork for the drawing room, painted with Phaser graphics.
 * Original shapes only. Replace with painted art later; hotspot positions
 * live in the case content, so art and logic stay independent.
 */

const FLOOR_Y = 480;
const TOP = 56; // below the objective bar

export function paintDrawingRoom(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  paintWall(g);
  paintFloor(g);
  paintWindow(g);
  paintPortrait(scene);
  paintFireplace(g);
  paintClock(scene);
  paintCabinet(g);
  paintDesk(g);
  paintArmchair(g);
  paintButton(g);
  paintGrain(scene);
  paintVignette(scene);
}

function paintWall(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x3f5a4a).fillRect(0, TOP, GAME_WIDTH, FLOOR_Y - TOP);
  // Striped wallpaper with a small diamond motif.
  for (let x = 0; x < GAME_WIDTH; x += 48) {
    g.fillStyle(0x46644f).fillRect(x, TOP, 24, FLOOR_Y - TOP);
    for (let y = TOP + 40; y < 380; y += 64) {
      g.fillStyle(0x6f8a68, 0.5).fillTriangle(x + 36, y - 8, x + 44, y, x + 36, y + 8);
      g.fillTriangle(x + 36, y - 8, x + 28, y, x + 36, y + 8);
    }
  }
  // Cornice and picture rail.
  g.fillStyle(0x2c2018).fillRect(0, TOP, GAME_WIDTH, 16);
  g.fillStyle(0xc9a25b, 0.6).fillRect(0, TOP + 16, GAME_WIDTH, 3);
  g.fillStyle(0x2c2018).fillRect(0, 88, GAME_WIDTH, 6);
  // Wood panelling below the dado rail.
  g.fillStyle(0x4a3226).fillRect(0, 380, GAME_WIDTH, FLOOR_Y - 380);
  g.fillStyle(0x6b4a32).fillRect(0, 376, GAME_WIDTH, 8);
  for (let x = 16; x < GAME_WIDTH; x += 120) {
    g.lineStyle(3, 0x3a271d).strokeRect(x, 396, 96, 68);
    g.lineStyle(1, 0x7a5a40, 0.6).strokeRect(x + 4, 400, 88, 60);
  }
  g.fillStyle(0x2c2018).fillRect(0, FLOOR_Y - 10, GAME_WIDTH, 10);
}

function paintFloor(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x6b4a32).fillRect(0, FLOOR_Y, GAME_WIDTH, GAME_HEIGHT - FLOOR_Y);
  const tones = [0x6b4a32, 0x633f2b, 0x74513a, 0x5e3f2c];
  let row = 0;
  for (let y = FLOOR_Y; y < GAME_HEIGHT; y += 24, row++) {
    const offset = (row % 3) * 70;
    for (let x = -offset; x < GAME_WIDTH; x += 210) {
      g.fillStyle(tones[(row + x / 210) & 3] ?? 0x6b4a32).fillRect(x, y, 208, 22);
    }
    g.fillStyle(0x3a271d, 0.6).fillRect(0, y + 22, GAME_WIDTH, 2);
  }
  // Patterned rug.
  const rx = 330, ry = 560, rw = 640, rh = 140;
  g.fillStyle(0x6e1f2a).fillRoundedRect(rx, ry, rw, rh, 10);
  g.lineStyle(6, 0xc9a25b, 0.9).strokeRoundedRect(rx + 10, ry + 10, rw - 20, rh - 20, 8);
  g.lineStyle(2, 0x2d4a5e).strokeRoundedRect(rx + 22, ry + 22, rw - 44, rh - 44, 6);
  for (let i = 0; i < 7; i++) {
    const cx = rx + 80 + i * 80;
    g.fillStyle(i % 2 ? 0x2d4a5e : 0xc9a25b, 0.85);
    g.fillTriangle(cx, ry + 45, cx + 22, ry + 70, cx, ry + 95);
    g.fillTriangle(cx, ry + 45, cx - 22, ry + 70, cx, ry + 95);
  }
}

function paintWindow(g: Phaser.GameObjects.Graphics): void {
  const x = 70, y = 105, w = 190, h = 250;
  // Stormy sky.
  g.fillGradientStyle(0x2b3a52, 0x2b3a52, 0x5b6b80, 0x5b6b80).fillRect(x + 10, y + 10, w - 20, h - 20);
  g.fillStyle(0x1d2633).fillTriangle(x + 10, y + 200, x + 70, y + 150, x + 130, y + 200);
  g.fillStyle(0x1d2633).fillRect(x + 10, y + 200, w - 20, h - 210);
  g.lineStyle(1, 0xbfd0e6, 0.5);
  for (let i = 0; i < 18; i++) {
    const rx = x + 16 + ((i * 37) % (w - 32));
    const ry = y + 16 + ((i * 53) % (h - 60));
    g.lineBetween(rx, ry, rx - 4, ry + 16);
  }
  // Frame and glazing bars; the right casement swings open.
  g.lineStyle(10, 0xe9dcc4).strokeRect(x, y, w, h);
  g.lineStyle(6, 0xe9dcc4).lineBetween(x + w / 2, y, x + w / 2, y + h);
  g.lineBetween(x, y + h / 2, x + w / 2, y + h / 2);
  g.fillStyle(0xdccfb6, 0.9).fillPoints(
    [
      new Phaser.Math.Vector2(x + w / 2, y),
      new Phaser.Math.Vector2(x + w + 26, y + 18),
      new Phaser.Math.Vector2(x + w + 26, y + h - 18),
      new Phaser.Math.Vector2(x + w / 2, y + h),
    ],
    true,
  );
  g.fillStyle(0x8fa5bf, 0.5).fillPoints(
    [
      new Phaser.Math.Vector2(x + w / 2 + 10, y + 12),
      new Phaser.Math.Vector2(x + w + 18, y + 28),
      new Phaser.Math.Vector2(x + w + 18, y + h - 28),
      new Phaser.Math.Vector2(x + w / 2 + 10, y + h - 12),
    ],
    true,
  );
  // Curtains and sill with raindrops.
  g.fillStyle(0x7a2433).fillRect(x - 30, y - 15, 34, h + 40);
  g.fillStyle(0x5e1b27).fillRect(x - 20, y - 15, 6, h + 40);
  g.fillStyle(0xc9a25b).fillRect(x - 40, y - 22, w + 90, 8);
  g.fillStyle(0xe9dcc4).fillRect(x - 10, y + h, w + 20, 12);
  g.fillStyle(0x9ec3e6, 0.8);
  [20, 60, 95, 140].forEach((dx) => g.fillCircle(x + dx, y + h + 6, 3));
}

function paintPortrait(scene: Phaser.Scene): void {
  // Drawn in a container so the whole frame can hang a little crooked.
  const x = 330, y = 105, w = 150, h = 195;
  const c = scene.add.container(x + w / 2, y + h / 2).setAngle(3);
  const g = scene.add.graphics();
  g.fillStyle(0x8a6a2a).fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle(0xc9a25b).fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12);
  g.fillStyle(0x2a2a3a).fillRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 36);
  // A grand lady in an old-fashioned gown, wearing a blue brooch.
  g.fillStyle(0x5a2d5e).fillTriangle(-46, 75, 46, 75, 0, -5);
  g.fillStyle(0xe8c7a8).fillCircle(0, -25, 18);
  g.fillStyle(0x6b6b6b).fillCircle(0, -44, 14).fillEllipse(0, -32, 44, 20);
  g.fillStyle(0xe8c7a8).fillCircle(0, -24, 15);
  g.fillStyle(0x2a2a3a).fillCircle(-5, -26, 2).fillCircle(5, -26, 2);
  g.fillStyle(0x3d7dd8).fillCircle(0, 12, 7);
  g.fillStyle(0xbfe0ff).fillCircle(-2, 10, 2);
  c.add(g);
  // A brass hook peeks out from behind the frame.
  const hook = scene.add.graphics();
  hook.fillStyle(0xc9a25b).fillCircle(x + w + 4, y + 30, 4);
  hook.lineStyle(2, 0x8a6a2a).strokeCircle(x + w + 4, y + 30, 4);
}

function paintFireplace(g: Phaser.GameObjects.Graphics): void {
  const x = 540, y = 300, w = 240, h = 180;
  g.fillStyle(0x8c8378).fillRect(x, y, w, h);
  g.lineStyle(1, 0x6e665d, 0.8);
  for (let by = y + 20; by < y + h; by += 20) {
    g.lineBetween(x, by, x + w, by);
    for (let bx = x + ((by / 20) % 2 ? 0 : 20); bx < x + w; bx += 40) g.lineBetween(bx, by - 20, bx, by);
  }
  // Mantel shelf.
  g.fillStyle(0x3a271d).fillRect(x - 24, y - 12, w + 48, 18);
  g.fillStyle(0x5a3d2b).fillRect(x - 16, y + 6, w + 32, 8);
  // Firebox with cold ashes and an iron grate.
  g.fillStyle(0x1a1512).fillRoundedRect(x + 50, y + 50, w - 100, h - 50, { tl: 50, tr: 50, bl: 0, br: 0 });
  g.fillStyle(0x6d6a66).fillEllipse(x + w / 2, y + h - 18, 110, 22);
  g.fillStyle(0x8f8b86).fillEllipse(x + w / 2 - 20, y + h - 22, 40, 12);
  g.lineStyle(4, 0x2e2e2e);
  for (let i = 0; i < 5; i++) g.lineBetween(x + 80 + i * 20, y + h - 40, x + 80 + i * 20, y + h - 10);
  g.lineBetween(x + 74, y + h - 36, x + w - 74, y + h - 36);
  // Candlesticks on the mantel.
  g.fillStyle(0xc9a25b).fillRect(x - 6, y - 50, 8, 38).fillRect(x + w - 2, y - 50, 8, 38);
  g.fillStyle(0xf4e9d8).fillRect(x - 5, y - 70, 6, 20).fillRect(x + w - 1, y - 70, 6, 20);
}

function paintClock(scene: Phaser.Scene): void {
  // The clock sits crooked on the mantel, stopped at half past ten.
  const cx = 660, cy = 235;
  const c = scene.add.container(cx, cy).setAngle(-7);
  const g = scene.add.graphics();
  g.fillStyle(0x4a2e1e).fillRoundedRect(-44, -50, 88, 105, { tl: 40, tr: 40, bl: 6, br: 6 });
  g.fillStyle(0x6b4430).fillRoundedRect(-38, -44, 76, 93, { tl: 36, tr: 36, bl: 4, br: 4 });
  g.fillStyle(0xf4ecdc).fillCircle(0, -8, 30);
  g.lineStyle(3, 0xc9a25b).strokeCircle(0, -8, 30);
  g.fillStyle(0x2a2018);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.fillCircle(Math.sin(a) * 24, -8 - Math.cos(a) * 24, i % 3 === 0 ? 3 : 1.5);
  }
  // Hour hand between 10 and 11, minute hand on 6.
  const hourAngle = ((10.5 / 12) * Math.PI * 2);
  g.lineStyle(4, 0x2a2018).lineBetween(0, -8, Math.sin(hourAngle) * 15, -8 - Math.cos(hourAngle) * 15);
  g.lineStyle(3, 0x2a2018).lineBetween(0, -8, 0, -8 + 22);
  g.fillStyle(0xc9a25b).fillCircle(0, -8, 3);
  g.fillStyle(0xc9a25b).fillRect(-40, 50, 80, 6);
  c.add(g);
}

function paintCabinet(g: Phaser.GameObjects.Graphics): void {
  const x = 830, y = 200, w = 160, h = 280;
  g.fillStyle(0x000000, 0.25).fillRect(x + 8, y + 8, w, h);
  g.fillStyle(0x4a2e1e).fillRect(x, y, w, h);
  g.fillStyle(0x3a2216).fillRect(x - 8, y - 14, w + 16, 18);
  // Glass doors showing shelves and the empty cushion.
  g.fillStyle(0x2c3b3a).fillRect(x + 14, y + 16, w - 28, 170);
  g.fillStyle(0xbfd8d6, 0.18).fillRect(x + 14, y + 16, w - 28, 170);
  g.fillStyle(0x6b4430).fillRect(x + 14, y + 72, w - 28, 6).fillRect(x + 14, y + 132, w - 28, 6);
  g.fillStyle(0x7a1f2b).fillRoundedRect(x + 46, y + 108, 68, 24, 8);
  g.fillStyle(0x9a2f3c).fillEllipse(x + 80, y + 116, 40, 10);
  // A few curiosities on the other shelves.
  g.fillStyle(0xd9c9a3).fillCircle(x + 50, y + 58, 12);
  g.fillStyle(0x6f8fa8).fillRect(x + 92, y + 40, 18, 32);
  g.fillStyle(0xb08d57).fillTriangle(x + 60, y + 186, x + 76, y + 150, x + 92, y + 186);
  // Glass shine and door frame.
  g.lineStyle(3, 0xffffff, 0.25).lineBetween(x + 24, y + 30, x + 44, y + 10 + 30);
  g.lineStyle(4, 0x2a180f).strokeRect(x + 14, y + 16, w - 28, 170);
  g.lineBetween(x + w / 2, y + 16, x + w / 2, y + 186);
  // Brass lock with keyhole.
  g.fillStyle(0xc9a25b).fillCircle(x + w / 2, y + 205, 9);
  g.fillStyle(0x1a1008).fillCircle(x + w / 2, y + 203, 3).fillRect(x + w / 2 - 1.5, y + 203, 3, 7);
  // Lower cupboard.
  g.lineStyle(3, 0x2a180f).strokeRect(x + 14, y + 224, w - 28, 46);
  // Faint violet fingerprints on the glass.
  g.fillStyle(0x8a4fc4, 0.55);
  [[890, 290], [904, 284], [918, 287], [930, 296]].forEach(([fx, fy]) => g.fillEllipse(fx!, fy!, 9, 12));
}

function paintDesk(g: Phaser.GameObjects.Graphics): void {
  const x = 300, y = 420, w = 230, h = 130;
  g.fillStyle(0x000000, 0.25).fillEllipse(x + w / 2, y + h + 4, w + 20, 18);
  g.fillStyle(0x5a3a26).fillRect(x + 10, y + 30, 18, h - 30).fillRect(x + w - 28, y + 30, 18, h - 30);
  g.fillStyle(0x6b4430).fillRect(x + 10, y + 30, w - 20, 50);
  g.lineStyle(2, 0x3a271d).strokeRect(x + 24, y + 40, 80, 30).strokeRect(x + w - 104, y + 40, 80, 30);
  g.fillStyle(0xc9a25b).fillCircle(x + 64, y + 55, 4).fillCircle(x + w - 64, y + 55, 4);
  g.fillStyle(0x7a5038).fillRect(x, y + 14, w, 18);
  g.fillStyle(0x3d6b4a).fillRect(x + 30, y + 14, w - 60, 6);
  // Paper, inkwell and pen.
  g.fillStyle(0xf4ecdc).fillRect(x + 60, y - 2, 70, 16);
  g.fillStyle(0x1a1a1a).fillRoundedRect(x + 150, y - 8, 26, 22, 4);
  g.fillStyle(0x000000).fillEllipse(x + 163, y - 8, 18, 6);
  g.lineStyle(2, 0xf4ecdc).lineBetween(x + 166, y - 6, x + 190, y - 40);
  g.fillStyle(0xf4ecdc).fillTriangle(x + 186, y - 36, x + 200, y - 52, x + 192, y - 30);
}

function paintArmchair(g: Phaser.GameObjects.Graphics): void {
  // Professor Quill's armchair, beside the window.
  g.fillStyle(0x2d4a5e).fillRoundedRect(30, 470, 180, 150, 20);
  g.fillStyle(0x3b5d75).fillRoundedRect(20, 520, 40, 110, 14).fillRoundedRect(180, 520, 40, 110, 14);
  g.fillStyle(0x3a271d).fillRect(40, 625, 12, 24).fillRect(188, 625, 12, 24);
}

function paintButton(g: Phaser.GameObjects.Graphics): void {
  const cx = 245, cy = 648;
  g.fillStyle(0x8a6a2a).fillCircle(cx, cy, 10);
  g.fillStyle(0xe6c27a).fillCircle(cx, cy, 8);
  g.fillStyle(0x8a6a2a).fillCircle(cx - 2, cy - 2, 1.5).fillCircle(cx + 2, cy + 2, 1.5);
  g.fillStyle(0xffffff, 0.9).fillCircle(cx + 4, cy - 4, 2);
}

/** A light speckled grain so flat colours feel more like a painting. */
function paintGrain(scene: Phaser.Scene): void {
  const key = 'grain';
  if (!scene.textures.exists(key)) {
    const tex = scene.textures.createCanvas(key, 256, 256);
    if (!tex) return;
    const ctx = tex.getContext();
    const rng = new Phaser.Math.RandomDataGenerator(['blackthorn']);
    for (let i = 0; i < 2600; i++) {
      const shade = rng.between(0, 1) ? 255 : 0;
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${rng.realInRange(0.03, 0.08)})`;
      ctx.fillRect(rng.between(0, 255), rng.between(0, 255), rng.between(1, 2), rng.between(1, 2));
    }
    tex.refresh();
  }
  scene.add.tileSprite(0, TOP, GAME_WIDTH, GAME_HEIGHT - TOP, key).setOrigin(0, 0);
}

function paintVignette(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.35, 0.35, 0, 0).fillRect(0, TOP, GAME_WIDTH, 60);
  g.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.35, 0.35).fillRect(0, GAME_HEIGHT - 60, GAME_WIDTH, 60);
}
