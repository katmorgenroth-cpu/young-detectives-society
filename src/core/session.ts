import { submitContradiction, type ContradictionAnswer, type DeductionOutcome } from './deduction';
import { enterNode, type NodeResult } from './dialogue';
import { revealNextHint } from './hints';
import { examineHotspot, type ExamineResult } from './hotspots';
import { clearSave, loadGame, saveGame, type LoadResult, type SaveStorage } from './save';
import { createInitialState, markIntroSeen } from './state';
import type { CaseData, Deduction, DialogueNodeId, DialogueTree, GameState, Hotspot } from './types';

type Listener = (state: GameState) => void;

/**
 * The single owner of game state during play. Scenes call these methods
 * instead of changing state themselves, and every change is autosaved.
 */
export class GameSession {
  private current: GameState;
  private readonly listeners = new Set<Listener>();
  /** False if the last autosave failed, so the UI can warn the player. */
  saveOk = true;

  constructor(
    readonly caseData: CaseData,
    private readonly storage: SaveStorage,
    initial?: GameState,
  ) {
    this.current = initial ?? createInitialState(caseData);
  }

  static load(caseData: CaseData, storage: SaveStorage): { session: GameSession; result: LoadResult } {
    const result = loadGame(storage, caseData);
    return { session: new GameSession(caseData, storage, result.state), result };
  }

  get state(): GameState {
    return this.current;
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private commit(next: GameState): void {
    if (next === this.current) return;
    this.current = next;
    this.saveOk = saveGame(this.storage, next);
    this.listeners.forEach((l) => l(next));
  }

  examine(hotspot: Hotspot): ExamineResult {
    const result = examineHotspot(this.current, hotspot);
    this.commit(result.state);
    return result;
  }

  talk(tree: DialogueTree, nodeId: DialogueNodeId): NodeResult {
    const result = enterNode(this.current, tree, nodeId);
    this.commit(result.state);
    return result;
  }

  submitDeduction(deduction: Deduction, answer: ContradictionAnswer): DeductionOutcome {
    const { state, outcome } = submitContradiction(this.current, deduction, answer);
    this.commit(state);
    return outcome;
  }

  revealHint(deduction: Deduction): void {
    this.commit(revealNextHint(this.current, deduction));
  }

  finishIntro(): void {
    this.commit(markIntroSeen(this.current));
  }

  /** Start the case again from the beginning. */
  restart(): void {
    clearSave(this.storage, this.caseData.id);
    this.commit(createInitialState(this.caseData));
  }
}

/** In-memory storage for tests and for browsers that block localStorage. */
export class MemoryStorage implements SaveStorage {
  private readonly data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
}
