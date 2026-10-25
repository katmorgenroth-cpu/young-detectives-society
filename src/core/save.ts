import { createInitialState } from './state';
import type { CaseData, GameState } from './types';

export const SAVE_VERSION = 1;

/** Minimal storage interface so saving can be tested without a browser. */
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface SaveFile {
  version: number;
  savedAt: string;
  state: GameState;
}

export type LoadResult =
  | { status: 'loaded'; state: GameState }
  | { status: 'empty'; state: GameState }
  /** The save could not be read; the player starts fresh and is told why. */
  | { status: 'corrupt'; state: GameState; reason: string };

export function saveKey(caseId: string): string {
  return `yds.save.${caseId}`;
}

export function serialize(state: GameState, now: Date = new Date()): string {
  const file: SaveFile = { version: SAVE_VERSION, savedAt: now.toISOString(), state };
  return JSON.stringify(file);
}

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isCountMap = (v: unknown): v is Record<string, number> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && Object.values(v).every((n) => typeof n === 'number');

/**
 * Parse a save and keep only ids that still exist in the case, so an
 * older save keeps working after content is edited.
 */
export function deserialize(raw: string, caseData: CaseData): LoadResult {
  const fresh = createInitialState(caseData);
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'corrupt', state: fresh, reason: 'The save file could not be read.' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { status: 'corrupt', state: fresh, reason: 'The save file is empty.' };
  }
  const file = parsed as Partial<SaveFile>;
  if (file.version !== SAVE_VERSION) {
    return { status: 'corrupt', state: fresh, reason: 'The save is from a different version of the game.' };
  }
  const s = file.state as Partial<GameState> | undefined;
  if (
    !s ||
    s.caseId !== caseData.id ||
    !isStringArray(s.evidence) ||
    !isStringArray(s.statements) ||
    !isStringArray(s.flags) ||
    !isStringArray(s.examinedHotspots) ||
    !isStringArray(s.visitedDialogueNodes) ||
    !isStringArray(s.solvedDeductions) ||
    !isCountMap(s.hintsRevealed) ||
    !isCountMap(s.deductionAttempts) ||
    typeof s.introSeen !== 'boolean'
  ) {
    return { status: 'corrupt', state: fresh, reason: 'The save file is damaged.' };
  }

  const known = (list: string[], valid: { id: string }[]) => {
    const ids = new Set(valid.map((v) => v.id));
    return list.filter((id) => ids.has(id));
  };
  const nodes = caseData.dialogues.flatMap((t) => t.nodes);

  return {
    status: 'loaded',
    state: {
      caseId: caseData.id,
      evidence: known(s.evidence, caseData.evidence),
      statements: known(s.statements, caseData.statements),
      flags: [...s.flags],
      examinedHotspots: known(s.examinedHotspots, caseData.room.hotspots),
      visitedDialogueNodes: known(s.visitedDialogueNodes, nodes),
      solvedDeductions: known(s.solvedDeductions, caseData.deductions),
      hintsRevealed: { ...s.hintsRevealed },
      deductionAttempts: { ...s.deductionAttempts },
      introSeen: s.introSeen,
    },
  };
}

export function loadGame(storage: SaveStorage, caseData: CaseData): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(saveKey(caseData.id));
  } catch {
    return { status: 'corrupt', state: createInitialState(caseData), reason: 'Saving is not available in this browser.' };
  }
  if (raw === null) return { status: 'empty', state: createInitialState(caseData) };
  return deserialize(raw, caseData);
}

/** Returns false if the browser refused to save (private mode, full storage). */
export function saveGame(storage: SaveStorage, state: GameState): boolean {
  try {
    storage.setItem(saveKey(state.caseId), serialize(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(storage: SaveStorage, caseId: string): void {
  try {
    storage.removeItem(saveKey(caseId));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
