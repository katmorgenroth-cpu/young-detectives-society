import type { Deduction, GameState } from './types';

/** Hints already revealed for a deduction, gentlest first. */
export function revealedHints(state: GameState, deduction: Deduction): string[] {
  const count = state.hintsRevealed[deduction.id] ?? 0;
  return deduction.hints.slice(0, count);
}

export function hasMoreHints(state: GameState, deduction: Deduction): boolean {
  return (state.hintsRevealed[deduction.id] ?? 0) < deduction.hints.length;
}

/** Reveal the next hint. Hints are optional and never cost the player anything. */
export function revealNextHint(state: GameState, deduction: Deduction): GameState {
  const count = state.hintsRevealed[deduction.id] ?? 0;
  if (count >= deduction.hints.length) return state;
  return { ...state, hintsRevealed: { ...state.hintsRevealed, [deduction.id]: count + 1 } };
}
