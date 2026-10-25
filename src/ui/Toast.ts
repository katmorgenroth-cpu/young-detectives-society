import Phaser from 'phaser';
import { colors, depth, fonts, GAME_WIDTH, sizes, textColors } from './theme';

/** A short notice under the top bar, e.g. "New clue added to your journal". */
export class Toast {
  private current: Phaser.GameObjects.Container | null = null;

  constructor(private readonly scene: Phaser.Scene) {}

  show(title: string, detail: string): void {
    this.current?.destroy();
    const text = this.scene.add.text(0, 0, [title, detail], {
      fontFamily: fonts.body,
      fontSize: `${sizes.small}px`,
      color: textColors.dark,
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5, 0);
    const w = Math.max(360, text.width + 48);
    const h = text.height + 24;
    const g = this.scene.add.graphics();
    g.fillStyle(colors.paper).fillRoundedRect(-w / 2, 0, w, h, 12);
    g.lineStyle(3, colors.good).strokeRoundedRect(-w / 2, 0, w, h, 12);
    text.setY(12);
    const c = this.scene.add.container(GAME_WIDTH / 2, 72, [g, text]).setDepth(depth.toast).setAlpha(0);
    this.current = c;
    this.scene.tweens.add({ targets: c, alpha: 1, y: 80, duration: 200 });
    this.scene.tweens.add({
      targets: c,
      alpha: 0,
      delay: 2600,
      duration: 400,
      onComplete: () => {
        if (this.current === c) this.current = null;
        c.destroy();
      },
    });
  }
}
