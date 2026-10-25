import Phaser from 'phaser';
import { blackthornCase } from '../content/blackthorn/case';
import { GameSession, MemoryStorage } from '../core/session';
import type { SaveStorage } from '../core/save';
import { validateCase } from '../core/validation';
import { colors, fonts, GAME_HEIGHT, GAME_WIDTH, sizes, textColors } from '../ui/theme';
import { setSession } from './sessionRegistry';

/** Shows a loading state, checks the case content, and loads any saved game. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const loading = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Opening the case file...', {
      fontFamily: fonts.title, fontSize: `${sizes.heading}px`, color: textColors.light,
    }).setOrigin(0.5);

    const report = validateCase(blackthornCase);
    if (report.errors.length > 0) {
      loading.destroy();
      this.showContentError(report.errors);
      return;
    }
    if (report.warnings.length > 0) console.warn('Case content warnings:', report.warnings);

    const { session, result } = GameSession.load(blackthornCase, browserStorage());
    if (result.status === 'corrupt') console.warn('Save could not be loaded:', result.reason);
    setSession(this, session, result);
    this.time.delayedCall(150, () => this.scene.start('Title'));
  }

  private showContentError(errors: string[]): void {
    this.cameras.main.setBackgroundColor(colors.panel);
    this.add.text(60, 60, 'This case file has a problem, so the game can\'t start.', {
      fontFamily: fonts.body, fontSize: `${sizes.heading}px`, color: textColors.light, wordWrap: { width: GAME_WIDTH - 120 },
    });
    // Details are for developers; players only see the first few lines.
    this.add.text(60, 130, errors.slice(0, 12).join('\n'), {
      fontFamily: 'monospace', fontSize: '16px', color: textColors.muted, wordWrap: { width: GAME_WIDTH - 120 },
    });
    console.error('Case validation failed:', errors);
  }
}

/** localStorage when available; otherwise play continues without saving. */
function browserStorage(): SaveStorage {
  try {
    const probe = '__yds_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return new MemoryStorage();
  }
}
