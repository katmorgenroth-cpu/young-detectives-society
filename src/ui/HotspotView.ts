import Phaser from 'phaser';
import type { Rect } from '../core/types';
import type { Focusable } from './FocusManager';
import { colors, depth, fonts, sizes, textColors } from './theme';

/**
 * A clickable area in the room (an object or a person). Hovering, tapping
 * or keyboard focus shows a glowing outline and a name tag so players
 * always know what can be examined. No pixel hunting.
 */
export class HotspotView implements Focusable {
  private readonly zone: Phaser.GameObjects.Zone;
  private readonly outline: Phaser.GameObjects.Graphics;
  private readonly tag: Phaser.GameObjects.Container;
  private readonly tagText: Phaser.GameObjects.Text;
  private readonly tagBg: Phaser.GameObjects.Graphics;
  private hovered = false;
  private focused = false;
  private showAll = false;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    private readonly area: Rect,
    private label: string,
    private readonly onActivate: () => void,
    private readonly kind: 'object' | 'person',
  ) {
    this.outline = scene.add.graphics().setDepth(depth.hotspots + (kind === 'person' ? 15 : 0));
    this.zone = scene.add
      .zone(area.x, area.y, area.width, area.height)
      .setOrigin(0, 0)
      .setDepth(depth.hotspots + (kind === 'person' ? 16 : 1))
      .setInteractive({ useHandCursor: true });

    this.tagText = scene.add.text(0, 0, label, {
      fontFamily: fonts.body,
      fontSize: `${sizes.small}px`,
      color: textColors.dark,
    }).setOrigin(0.5, 0.5);
    this.tagBg = scene.add.graphics();
    this.tag = scene.add.container(0, 0, [this.tagBg, this.tagText]).setDepth(depth.hud - 1).setVisible(false);
    this.layoutTag();

    this.zone.on('pointerover', () => { this.hovered = true; this.redraw(); });
    this.zone.on('pointerout', () => { this.hovered = false; this.redraw(); });
    this.zone.on('pointerup', () => {
      if (this.enabled) this.onActivate();
    });
    this.redraw();
  }

  setShowAll(show: boolean): void {
    this.showAll = show;
    this.redraw();
  }

  /** Disabled while a panel is open, so clicks can't fall through. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.hovered = false;
    this.redraw();
  }

  setLabel(label: string): void {
    if (label === this.label) return;
    this.label = label;
    this.tagText.setText(label);
    this.layoutTag();
  }

  /** Size the name tag to its text and keep it fully on screen. */
  private layoutTag(): void {
    const { area } = this;
    const tagW = this.tagText.width + 28;
    const tagH = this.tagText.height + 14;
    this.tagBg.clear();
    this.tagBg.fillStyle(this.kind === 'person' ? 0xdfe8f2 : colors.paper, 0.97).fillRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 10);
    this.tagBg.lineStyle(2, colors.ink, 0.8).strokeRoundedRect(-tagW / 2, -tagH / 2, tagW, tagH, 10);
    const screenW = this.tag.scene.scale.gameSize.width;
    this.tag.setPosition(
      Phaser.Math.Clamp(area.x + area.width / 2, tagW / 2 + 8, screenW - tagW / 2 - 8),
      Math.max(78, area.y - tagH / 2 - 6),
    );
  }

  setFocused(focused: boolean): void {
    this.focused = focused;
    this.redraw();
  }

  canFocus(): boolean {
    return this.enabled && this.zone.visible;
  }

  activate(): void {
    if (this.enabled) this.onActivate();
  }

  setVisible(visible: boolean): void {
    this.zone.setVisible(visible);
    if (visible) this.zone.setInteractive({ useHandCursor: true });
    else this.zone.disableInteractive();
    this.redraw();
  }

  destroy(): void {
    this.zone.destroy();
    this.outline.destroy();
    this.tag.destroy();
  }

  get x(): number {
    return this.area.x;
  }

  private redraw(): void {
    const { x, y, width, height } = this.area;
    const g = this.outline;
    g.clear();
    const visible = this.zone.visible;
    const active = visible && this.enabled && (this.hovered || this.focused);
    const hint = visible && this.enabled && this.showAll && !active;

    if (active) {
      g.fillStyle(colors.hover, 0.16).fillRoundedRect(x, y, width, height, 14);
      g.lineStyle(4, this.focused ? colors.focus : colors.hover, 1).strokeRoundedRect(x, y, width, height, 14);
    } else if (hint) {
      g.lineStyle(3, colors.hover, 0.75).strokeRoundedRect(x, y, width, height, 14);
    }
    this.tag.setVisible(active || hint);
  }
}
