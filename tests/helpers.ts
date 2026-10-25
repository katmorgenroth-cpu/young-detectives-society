import { blackthornCase } from '../src/content/blackthorn/case';
import { GameSession, MemoryStorage } from '../src/core/session';
import type { DialogueTree, Hotspot } from '../src/core/types';

export function newSession() {
  const storage = new MemoryStorage();
  return { session: new GameSession(blackthornCase, storage), storage };
}

export function hotspot(id: string): Hotspot {
  const h = blackthornCase.room.hotspots.find((x) => x.id === id);
  if (!h) throw new Error(`No hotspot ${id}`);
  return h;
}

export function tree(character: string): DialogueTree {
  const t = blackthornCase.dialogues.find((x) => x.character === character);
  if (!t) throw new Error(`No dialogue for ${character}`);
  return t;
}

/** Collect everything the deduction needs, the way a player would. */
export function gatherDeductionClues(session: GameSession) {
  session.examine(hotspot('hs_cabinet'));
  session.examine(hotspot('hs_fingerprint'));
  session.examine(hotspot('hs_desk'));
  session.talk(tree('quill'), 'pq_start');
  session.talk(tree('quill'), 'pq_where');
  session.talk(tree('quill'), 'pq_notes');
}
