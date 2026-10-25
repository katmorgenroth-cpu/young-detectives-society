import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { FocusManager } from '../ui/FocusManager';
import { colors, fonts, GAME_HEIGHT, GAME_WIDTH, sizes, textColors } from '../ui/theme';
import { getSession, takeLoadResult } from './sessionRegistry';

/** Title screen: start or continue the investigation. */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    const session = getSession(this);
    const loadResult = takeLoadResult(this);
    this.paintBackdrop();

    const cx = GAME_WIDTH / 2;
    this.add.text(cx, 96, 'The Young Detectives Society presents', {
      fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: textColors.gold, fontStyle: 'italic',
    }).setOrigin(0.5);
    this.add.text(cx, 170, 'The Curious Case of\nBlackthorn Manor', {
      fontFamily: fonts.title, fontSize: '64px', color: textColors.light, fontStyle: 'bold', align: 'center', lineSpacing: 6,
      shadow: { offsetX: 3, offsetY: 4, color: '#000000', blur: 6, fill: true },
    }).setOrigin(0.5, 0);
    this.add.text(cx, 340, session.caseData.chapter, {
      fontFamily: fonts.title, fontSize: '28px', color: textColors.gold, fontStyle: 'italic',
    }).setOrigin(0.5);

    const focus = new FocusManager(this);
    const { state } = session;
    const hasProgress = state.introSeen || state.evidence.length > 0 || state.statements.length > 0;
    const buttons: Button[] = [];

    const start = (fresh: boolean) => {
      if (fresh) session.restart();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Room'));
    };

    if (hasProgress) {
      buttons.push(new Button(this, { x: cx - 170, y: 410, width: 340, height: 64, label: 'Continue Investigation', fontSize: 26, onClick: () => start(false) }));
      let confirming = false;
      const restart = new Button(this, {
        x: cx - 170, y: 490, width: 340, height: 56, label: 'Start Over', fontSize: sizes.small,
        onClick: () => {
          if (confirming) return start(true);
          confirming = true;
          restart.setLabel('Tap again to erase progress');
        },
      });
      buttons.push(restart);
    } else {
      buttons.push(new Button(this, { x: cx - 170, y: 430, width: 340, height: 68, label: 'Start Investigation', fontSize: 28, onClick: () => start(true) }));
    }
    focus.pushLayer('title', buttons);

    if (loadResult?.status === 'corrupt') {
      this.add.text(cx, 590, `${loadResult.reason} You'll start a fresh investigation.`, {
        fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: '#f2b8a2', align: 'center', wordWrap: { width: 800 },
      }).setOrigin(0.5);
    }
    this.add.text(cx, GAME_HEIGHT - 34, 'Click or tap to play. Keyboard: Tab to move, Enter to choose, Esc to go back.', {
      fontFamily: fonts.body, fontSize: '18px', color: textColors.muted,
    }).setOrigin(0.5);
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  /** Original placeholder art: the manor at night in the rain. */
  private paintBackdrop(): void {
    const g = this.add.graphics();
    g.fillGradientStyle(0x10182a, 0x10182a, 0x2c3550, 0x2c3550).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.fillStyle(0xf4ecd0, 0.9).fillCircle(1080, 110, 46);
    g.fillStyle(0x10182a, 1).fillCircle(1100, 98, 40);
    // Manor silhouette with lit windows.
    g.fillStyle(0x0b0f1a);
    g.fillRect(140, 470, 1000, 250);
    g.fillTriangle(120, 470, 640, 330, 1160, 470);
    g.fillRect(220, 380, 40, 100).fillRect(1010, 380, 40, 100);
    g.fillRect(590, 360, 100, 120).fillTriangle(580, 360, 640, 300, 700, 360);
    const lit = [[230, 520], [330, 520], [430, 520], [810, 520], [910, 520], [1010, 520], [330, 610], [910, 610], [620, 400]];
    for (const [x, y] of lit) {
      g.fillStyle(0xe6b85c, 0.85).fillRect(x!, y!, 40, 54);
      g.lineStyle(3, 0x0b0f1a).lineBetween(x! + 20, y!, x! + 20, y! + 54).lineBetween(x!, y! + 27, x! + 40, y! + 27);
    }
    g.fillStyle(0x3a2a1a).fillRoundedRect(605, 620, 70, 100, { tl: 35, tr: 35, bl: 0, br: 0 });
    // Rain.
    g.lineStyle(1, 0x9fb3d1, 0.35);
    const rng = new Phaser.Math.RandomDataGenerator(['rain']);
    for (let i = 0; i < 140; i++) {
      const x = rng.between(0, GAME_WIDTH);
      const y = rng.between(0, GAME_HEIGHT);
      g.lineBetween(x, y, x - 6, y + 22);
    }
    // Panel behind the title for contrast.
    g.fillStyle(colors.panel, 0.72).fillRoundedRect(GAME_WIDTH / 2 - 420, 70, 840, 300, 24);
    g.lineStyle(2, colors.gold, 0.8).strokeRoundedRect(GAME_WIDTH / 2 - 420, 70, 840, 300, 24);
  }
}
