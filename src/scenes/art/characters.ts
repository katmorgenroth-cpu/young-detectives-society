import Phaser from 'phaser';
import type { Character, Rect } from '../../core/types';

/**
 * Friendly placeholder figures, drawn to fit a placement rectangle.
 * Each figure is drawn around (0, 0) = the centre of its feet.
 */
export function paintCharacter(scene: Phaser.Scene, character: Character, area: Rect): Phaser.GameObjects.Container {
  const c = scene.add.container(area.x + area.width / 2, area.y + area.height);
  const g = scene.add.graphics();
  const scale = area.height / 330;
  g.fillStyle(0x000000, 0.25).fillEllipse(0, 0, 100, 16);
  switch (character.id) {
    case 'lady_blackthorn':
      paintLady(g);
      break;
    case 'pembroke':
      paintButler(g);
      break;
    case 'quill':
      paintProfessor(g);
      break;
    default:
      paintGeneric(g, character.color);
  }
  c.add(g).setScale(scale);
  return c;
}

function face(g: Phaser.GameObjects.Graphics, y: number, skin: number): void {
  g.fillStyle(skin).fillCircle(0, y, 26);
  g.fillStyle(0x2a2018).fillCircle(-9, y - 2, 3).fillCircle(9, y - 2, 3);
  g.fillStyle(0xd88a7a, 0.6).fillCircle(-15, y + 8, 5).fillCircle(15, y + 8, 5);
  g.lineStyle(2, 0x2a2018).beginPath().arc(0, y + 6, 9, 0.2, Math.PI - 0.2).strokePath();
}

function paintLady(g: Phaser.GameObjects.Graphics): void {
  // Bell-shaped gown.
  g.fillStyle(0x5e3a80).fillTriangle(-62, -4, 62, -4, 0, -200);
  g.fillStyle(0x7b4fa0).fillRoundedRect(-30, -230, 60, 110, 18);
  g.fillStyle(0x9b74bf).fillRect(-62, -24, 124, 20);
  g.fillStyle(0xf4ecdc).fillCircle(-12, -222, 4).fillCircle(0, -218, 4).fillCircle(12, -222, 4);
  // Arms.
  g.fillStyle(0x7b4fa0).fillRoundedRect(-44, -220, 16, 90, 8).fillRoundedRect(28, -220, 16, 90, 8);
  g.fillStyle(0xf0d2b6).fillCircle(-36, -126, 8).fillCircle(36, -126, 8);
  face(g, -262, 0xf0d2b6);
  // Silver hair in a tall bun.
  g.fillStyle(0xcfcfd6).fillEllipse(0, -282, 60, 26).fillCircle(0, -302, 16);
}

function paintButler(g: Phaser.GameObjects.Graphics): void {
  // Trousers and tailcoat.
  g.fillStyle(0x1f1f26).fillRect(-26, -120, 22, 118).fillRect(4, -120, 22, 118);
  g.fillStyle(0x111114).fillRoundedRect(-30, -6, 26, 8, 3).fillRoundedRect(4, -6, 26, 8, 3);
  g.fillStyle(0x22303f).fillRoundedRect(-40, -260, 80, 150, 14);
  g.fillTriangle(-40, -120, -14, -120, -34, -70).fillTriangle(40, -120, 14, -120, 34, -70);
  g.fillStyle(0xf4f1ea).fillTriangle(-16, -258, 16, -258, 0, -150);
  g.fillStyle(0x111114).fillTriangle(-12, -254, 0, -246, -12, -238).fillTriangle(12, -254, 0, -246, 12, -238);
  g.fillStyle(0xc9a25b).fillCircle(0, -200, 3).fillCircle(0, -180, 3);
  // One button is missing: a gap where the third should be.
  g.lineStyle(1, 0xc9a25b, 0.6).strokeCircle(0, -160, 3);
  g.fillStyle(0x22303f).fillRoundedRect(-56, -250, 18, 110, 8).fillRoundedRect(38, -250, 18, 110, 8);
  g.fillStyle(0xf4f1ea).fillCircle(-47, -136, 9).fillCircle(47, -136, 9);
  face(g, -290, 0xe8c4a2);
  // Neat grey side hair and a shiny head.
  g.fillStyle(0x8f8f96).fillEllipse(-24, -298, 12, 24).fillEllipse(24, -298, 12, 24);
  g.fillStyle(0xffffff, 0.5).fillEllipse(-6, -308, 14, 6);
}

function paintProfessor(g: Phaser.GameObjects.Graphics): void {
  g.fillStyle(0x4a3a2a).fillRect(-24, -110, 20, 108).fillRect(4, -110, 20, 108);
  g.fillStyle(0x2a1f17).fillRoundedRect(-28, -6, 26, 8, 3).fillRoundedRect(2, -6, 26, 8, 3);
  // Tweed coat over a green waistcoat.
  g.fillStyle(0x8a6d3b).fillRoundedRect(-42, -250, 84, 150, 16);
  g.fillStyle(0x3f6b45).fillRect(-16, -246, 32, 130);
  g.lineStyle(1, 0x6d5530, 0.6);
  for (let i = -40; i < 42; i += 8) g.lineBetween(i, -248, i, -102);
  g.fillStyle(0x8a6d3b).fillRoundedRect(-58, -240, 18, 100, 8).fillRoundedRect(40, -240, 18, 100, 8);
  // Notebook in one hand, violet-stained fingers.
  g.fillStyle(0x5a2a2a).fillRect(42, -150, 34, 44);
  g.fillStyle(0xf4ecdc).fillRect(46, -146, 26, 36);
  g.lineStyle(2, 0x8a4fc4).lineBetween(50, -138, 68, -138).lineBetween(50, -128, 64, -128).lineBetween(50, -118, 66, -118);
  g.fillStyle(0xe8c4a2).fillCircle(-49, -134, 9).fillCircle(49, -110, 9);
  g.fillStyle(0x8a4fc4).fillCircle(52, -104, 4);
  face(g, -278, 0xe8c4a2);
  // Round spectacles and wild white hair.
  g.lineStyle(2, 0x2a2018).strokeCircle(-9, -280, 8).strokeCircle(9, -280, 8).lineBetween(-1, -280, 1, -280);
  g.fillStyle(0xf4f4f4);
  [[-26, -298], [-14, -308], [0, -312], [14, -308], [26, -298], [-30, -284], [30, -284]].forEach(([x, y]) =>
    g.fillCircle(x!, y!, 10),
  );
}

function paintGeneric(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(color).fillRoundedRect(-40, -250, 80, 250, 20);
  face(g, -280, 0xe8c4a2);
}
