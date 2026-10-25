import Phaser from 'phaser';

export interface Focusable {
  setFocused(focused: boolean): void;
  activate(): void;
  /** Hidden or disabled items are skipped. */
  canFocus(): boolean;
}

interface Layer {
  name: string;
  items: Focusable[];
  onCancel: (() => void) | undefined;
  index: number;
}

/**
 * Keyboard access for every clickable thing. Tab / Shift+Tab (or arrow keys)
 * move focus, Enter / Space activate, Escape goes back. Only the top layer
 * (the room, the dialogue panel, or the journal) receives keys.
 */
export class FocusManager {
  private readonly layers: Layer[] = [];
  /** True after a key press, false after a click or tap. */
  private keyboardMode = false;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    scene.input.on('pointerdown', () => {
      this.keyboardMode = false;
      this.clearFocus();
    });
    if (!kb) return;
    kb.on('keydown', (event: KeyboardEvent) => {
      this.keyboardMode = true;
      this.handleKey(event);
    });
    // Stop the browser moving focus out of the canvas on Tab.
    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.TAB, Phaser.Input.Keyboard.KeyCodes.SPACE]);
  }

  pushLayer(name: string, items: Focusable[], onCancel?: () => void): void {
    this.popLayer(name);
    const top = this.top();
    top?.items[top.index]?.setFocused(false);
    this.layers.push({ name, items, onCancel, index: -1 });
    if (this.keyboardMode) this.move(1);
  }

  /** Replace the items of an existing layer, e.g. when dialogue choices change. */
  setItems(name: string, items: Focusable[]): void {
    const layer = this.layers.find((l) => l.name === name);
    if (!layer) return;
    layer.items[layer.index]?.setFocused(false);
    layer.items = items;
    layer.index = -1;
    if (this.keyboardMode && layer === this.top()) this.move(1);
  }

  popLayer(name: string): void {
    const i = this.layers.findIndex((l) => l.name === name);
    if (i === -1) return;
    const [layer] = this.layers.splice(i, 1);
    layer?.items[layer.index]?.setFocused(false);
    const top = this.top();
    top?.items[top.index]?.setFocused(true);
  }

  /** Drop keyboard focus highlight (used when the mouse takes over). */
  clearFocus(): void {
    const top = this.top();
    if (!top) return;
    top.items[top.index]?.setFocused(false);
    top.index = -1;
  }

  private top(): Layer | undefined {
    return this.layers[this.layers.length - 1];
  }

  private move(step: number): void {
    const layer = this.top();
    if (!layer || layer.items.length === 0) return;
    layer.items[layer.index]?.setFocused(false);
    const n = layer.items.length;
    let i = layer.index;
    for (let tries = 0; tries < n; tries++) {
      i = i < 0 ? (step > 0 ? 0 : n - 1) : (i + step + n) % n;
      if (layer.items[i]!.canFocus()) {
        layer.index = i;
        layer.items[i]!.setFocused(true);
        return;
      }
    }
    layer.index = -1;
  }

  private handleKey(event: KeyboardEvent): void {
    const layer = this.top();
    if (!layer) return;
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        this.move(event.shiftKey ? -1 : 1);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        this.move(1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        this.move(-1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const item = layer.items[layer.index];
        if (item?.canFocus()) item.activate();
        else this.move(1);
        break;
      }
      case 'Escape':
        layer.onCancel?.();
        break;
    }
  }
}
