import type Phaser from 'phaser';
import type { LoadResult } from '../core/save';
import type { GameSession } from '../core/session';

const SESSION_KEY = 'session';
const LOAD_KEY = 'loadResult';

export function setSession(scene: Phaser.Scene, session: GameSession, result: LoadResult): void {
  scene.registry.set(SESSION_KEY, session);
  scene.registry.set(LOAD_KEY, result);
}

export function getSession(scene: Phaser.Scene): GameSession {
  const session = scene.registry.get(SESSION_KEY) as GameSession | undefined;
  if (!session) throw new Error('Game session was not created. Boot must run first.');
  return session;
}

/** How the save loaded at startup, read once by the title screen. */
export function takeLoadResult(scene: Phaser.Scene): LoadResult | undefined {
  const result = scene.registry.get(LOAD_KEY) as LoadResult | undefined;
  scene.registry.remove(LOAD_KEY);
  return result;
}
