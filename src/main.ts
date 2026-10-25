import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { RoomScene } from './scenes/RoomScene';
import { TitleScene } from './scenes/TitleScene';
import { GAME_HEIGHT, GAME_WIDTH } from './ui/theme';

/** Friendly message if something goes badly wrong, instead of a blank screen. */
function showFatalError(error: unknown): void {
  console.error(error);
  const el = document.getElementById('fatal');
  const game = document.getElementById('game');
  if (!el) return;
  el.textContent = 'Oh no! Something went wrong and the game stopped. Please reload the page to try again. Your progress is saved automatically.';
  el.style.display = 'block';
  if (game) game.style.display = 'none';
}

window.addEventListener('error', (e) => showFatalError(e.error ?? e.message));
window.addEventListener('unhandledrejection', (e) => showFatalError(e.reason));

try {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#14110f',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
      // Support mouse and touch at once (e.g. touchscreen laptops).
      activePointers: 2,
    },
    scene: [BootScene, TitleScene, RoomScene],
  });
} catch (error) {
  showFatalError(error);
}
