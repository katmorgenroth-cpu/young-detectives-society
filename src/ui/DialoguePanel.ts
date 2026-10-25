import Phaser from 'phaser';
import { Button } from './Button';
import type { FocusManager } from './FocusManager';
import { colors, depth, fonts, GAME_HEIGHT, GAME_WIDTH, sizes, textColors } from './theme';

export interface PanelLine {
  /** Speaker name, or null for descriptions and narration. */
  name: string | null;
  text: string;
}

export interface PanelChoice {
  text: string;
  onPick: () => void;
}

const LAYER = 'dialogue';
const MARGIN = 40;
const PAD = 24;
const PANEL_W = GAME_WIDTH - MARGIN * 2;

/**
 * The panel along the bottom of the screen for descriptions and
 * conversations. It shows one line at a time; the last line of a step can
 * offer choices. "Back to room" is always available.
 */
export class DialoguePanel {
  private readonly root: Phaser.GameObjects.Container;
  private readonly blocker: Phaser.GameObjects.Rectangle;
  private content: Phaser.GameObjects.Container | null = null;
  private onClose: (() => void) | null = null;
  isOpen = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly focus: FocusManager,
  ) {
    // Invisible full-screen layer so the room can't be clicked behind the panel.
    this.blocker = scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.2)
      .setOrigin(0, 0)
      .setDepth(depth.dialogue - 1)
      .setInteractive()
      .setVisible(false);
    this.root = scene.add.container(0, 0).setDepth(depth.dialogue).setVisible(false);
  }

  /**
   * Show lines one by one. After the last line, show `choices` if given,
   * otherwise a Continue button that calls `onEnd`.
   * `onClose` runs if the player leaves early with "Back to room" or Escape.
   */
  play(lines: PanelLine[], options: { choices?: PanelChoice[]; onEnd?: () => void; onClose?: () => void } = {}): void {
    if (!this.isOpen) {
      this.isOpen = true;
      this.blocker.setVisible(true);
      this.root.setVisible(true);
      this.focus.pushLayer(LAYER, [], () => this.close());
    }
    this.onClose = options.onClose ?? options.onEnd ?? null;
    this.showLine(lines, 0, options.choices, options.onEnd);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.content?.destroy();
    this.content = null;
    this.blocker.setVisible(false);
    this.root.setVisible(false);
    this.focus.popLayer(LAYER);
    const cb = this.onClose;
    this.onClose = null;
    cb?.();
  }

  /** Close without running the close callback, e.g. before switching to another panel. */
  dismiss(): void {
    this.onClose = null;
    this.close();
  }

  private showLine(lines: PanelLine[], index: number, choices?: PanelChoice[], onEnd?: () => void): void {
    const line = lines[index];
    if (!line) {
      onEnd?.();
      return;
    }
    const isLast = index === lines.length - 1;
    const buttons: { text: string; onPick: () => void }[] = [];
    if (!isLast) {
      buttons.push({ text: 'Continue ▶', onPick: () => this.showLine(lines, index + 1, choices, onEnd) });
    } else if (choices && choices.length > 0) {
      buttons.push(...choices);
    } else {
      buttons.push({ text: 'Continue ▶', onPick: () => (onEnd ? onEnd() : this.close()) });
    }
    this.render(line, buttons, !isLast || !choices || choices.length === 0);
  }

  private render(line: PanelLine, choices: PanelChoice[], singleContinue: boolean): void {
    this.content?.destroy();
    const c = this.scene.add.container(0, 0);
    this.content = c;
    this.root.add(c);

    const textWidth = PANEL_W - PAD * 2;
    const body = this.scene.add.text(0, 0, line.text, {
      fontFamily: fonts.body,
      fontSize: `${sizes.body}px`,
      color: textColors.light,
      wordWrap: { width: textWidth },
      lineSpacing: 8,
    });

    // Choices sit in two columns so long conversations still fit on screen.
    const columns = singleContinue ? 1 : choices.length > 3 ? 2 : 1;
    const colGap = 16;
    const buttonWidth = singleContinue ? 220 : columns === 2 ? (textWidth - colGap) / 2 : textWidth;
    const buttonObjs = choices.map(
      (choice) =>
        new Button(this.scene, {
          x: 0,
          y: 0,
          width: buttonWidth,
          height: 52,
          label: choice.text,
          onClick: choice.onPick,
          alignLeft: !singleContinue,
          fontSize: sizes.small,
        }),
    );
    const rows = Math.ceil(buttonObjs.length / columns);
    const rowHeights: number[] = [];
    for (let r = 0; r < rows; r++) {
      rowHeights.push(Math.max(...buttonObjs.slice(r * columns, r * columns + columns).map((b) => b.buttonHeight)));
    }
    const buttonsHeight = rowHeights.reduce((a, b) => a + b + 10, 0);

    const nameH = line.name ? 40 : 0;
    const panelH = PAD + nameH + body.height + 20 + buttonsHeight + PAD - 10;
    const panelY = GAME_HEIGHT - 16 - panelH;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.35).fillRoundedRect(MARGIN + 4, panelY + 6, PANEL_W, panelH, 16);
    bg.fillStyle(colors.panel, 0.97).fillRoundedRect(MARGIN, panelY, PANEL_W, panelH, 16);
    bg.lineStyle(3, colors.panelEdge).strokeRoundedRect(MARGIN, panelY, PANEL_W, panelH, 16);
    bg.lineStyle(1, colors.panelEdge, 0.5).strokeRoundedRect(MARGIN + 6, panelY + 6, PANEL_W - 12, panelH - 12, 12);
    c.add(bg);

    let y = panelY + PAD;
    if (line.name) {
      const name = this.scene.add.text(MARGIN + PAD, y, line.name, {
        fontFamily: fonts.title,
        fontSize: `${sizes.heading - 4}px`,
        color: textColors.gold,
        fontStyle: 'bold',
      });
      c.add(name);
      y += nameH;
    }
    body.setPosition(MARGIN + PAD, y);
    c.add(body);
    y += body.height + 20;

    buttonObjs.forEach((b, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const rowY = rowHeights.slice(0, row).reduce((a, h) => a + h + 10, 0);
      const x = singleContinue ? MARGIN + PANEL_W - PAD - buttonWidth : MARGIN + PAD + col * (buttonWidth + colGap);
      b.setPosition(x, y + rowY);
      c.add(b);
    });

    const back = new Button(this.scene, {
      x: MARGIN + PANEL_W - 210,
      y: panelY - 64,
      width: 200,
      height: 52,
      label: '✕ Back to room',
      onClick: () => this.close(),
      fontSize: sizes.small,
    });
    c.add(back);

    this.focus.setItems(LAYER, [...buttonObjs, back]);
  }
}
