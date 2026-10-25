import Phaser from 'phaser';
import type { Focusable } from './FocusManager';
import { colors, fonts, sizes, textColors } from './theme';

export interface ButtonOptions {
  x: number;
  y: number;
  width: number;
  height?: number;
  label: string;
  onClick: () => void;
  fontSize?: number;
  /** Left-aligned text, used for dialogue choices and lists. */
  alignLeft?: boolean;
  /** Lighter paper style, used inside the journal. */
  variant?: 'wood' | 'paper';
}

/**
 * A large, clearly labelled button with hover, pressed, focused, selected
 * and disabled states. Positioned by its top-left corner.
 */
export class Button extends Phaser.GameObjects.Container implements Focusable {
  private readonly bg: Phaser.GameObjects.Graphics;
  private readonly labelText: Phaser.GameObjects.Text;
  private readonly bw: number;
  private readonly bh: number;
  private readonly style: 'wood' | 'paper';
  private hovered = false;
  private pressed = false;
  private focused = false;
  private selected = false;
  private enabled = true;
  private destroyed = false;

  constructor(scene: Phaser.Scene, private readonly options: ButtonOptions) {
    super(scene, options.x, options.y);
    this.style = options.variant ?? 'wood';
    const fontSize = options.fontSize ?? sizes.body;
    this.bw = options.width;

    const padX = 18;
    this.labelText = scene.add.text(options.alignLeft ? padX : options.width / 2, 0, options.label, {
      fontFamily: fonts.body,
      fontSize: `${fontSize}px`,
      color: this.style === 'wood' ? textColors.light : textColors.dark,
      wordWrap: { width: options.width - padX * 2 },
      align: options.alignLeft ? 'left' : 'center',
      lineSpacing: 4,
    });
    this.bh = Math.max(options.height ?? sizes.touchTarget, this.labelText.height + 20);
    this.labelText.setOrigin(options.alignLeft ? 0 : 0.5, 0.5).setY(this.bh / 2);

    this.bg = scene.add.graphics();
    this.add([this.bg, this.labelText]);
    this.setSize(this.bw, this.bh);
    // Containers hit-test from their centre, so offset the hit area.
    this.setInteractive(new Phaser.Geom.Rectangle(this.bw / 2, this.bh / 2, this.bw, this.bh), Phaser.Geom.Rectangle.Contains);
    if (this.input) this.input.cursor = 'pointer';

    this.on('pointerover', () => { this.hovered = true; this.redraw(); });
    this.on('pointerout', () => { this.hovered = false; this.pressed = false; this.redraw(); });
    this.on('pointerdown', () => { this.pressed = true; this.redraw(); });
    this.on('pointerup', () => {
      const wasPressed = this.pressed;
      this.pressed = false;
      this.redraw();
      if (wasPressed) this.activate();
    });

    this.once(Phaser.GameObjects.Events.DESTROY, () => { this.destroyed = true; });
    this.redraw();
    scene.add.existing(this);
  }

  get buttonHeight(): number {
    return this.bh;
  }

  setLabel(label: string): this {
    this.labelText.setText(label);
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    if (this.input) this.input.cursor = enabled ? 'pointer' : 'default';
    this.redraw();
    return this;
  }

  setSelected(selected: boolean): this {
    this.selected = selected;
    this.redraw();
    return this;
  }

  setFocused(focused: boolean): void {
    this.focused = focused;
    this.redraw();
  }

  canFocus(): boolean {
    return !this.destroyed && this.enabled && this.visible && this.active;
  }

  activate(): void {
    if (!this.enabled || !this.visible) return;
    this.options.onClick();
  }

  private redraw(): void {
    if (this.destroyed) return;
    const g = this.bg;
    g.clear();
    const wood = this.style === 'wood';
    let fill: number = wood ? colors.button : colors.paper;
    if (!this.enabled) fill = wood ? colors.buttonDisabled : colors.paperDark;
    else if (this.pressed) fill = wood ? colors.buttonPressed : 0xd8c4a0;
    else if (this.selected) fill = wood ? colors.good : 0xcfe0b8;
    else if (this.hovered || this.focused) fill = wood ? colors.buttonHover : colors.hover;

    g.fillStyle(0x000000, 0.25).fillRoundedRect(3, 4, this.bw, this.bh, 12);
    g.fillStyle(fill, 1).fillRoundedRect(0, this.pressed ? 2 : 0, this.bw, this.bh, 12);
    g.lineStyle(2, this.selected ? colors.good : colors.gold, this.enabled ? 1 : 0.4).strokeRoundedRect(0, 0, this.bw, this.bh, 12);
    if (this.focused) {
      g.lineStyle(4, colors.focus, 1).strokeRoundedRect(-5, -5, this.bw + 10, this.bh + 10, 15);
    }
    this.labelText.setColor(
      !this.enabled ? textColors.disabled : wood ? textColors.light : textColors.dark,
    );
  }
}
