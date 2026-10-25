import { evaluateCondition } from './state';
import type { CaseData, GameState, Objective } from './types';

/**
 * The objective after the furthest one already completed, or null once
 * the last is done. Players who explore out of order are never sent back
 * to an earlier step they no longer need.
 */
export function currentObjective(state: GameState, caseData: CaseData): Objective | null {
  const { objectives } = caseData;
  for (let i = objectives.length - 1; i >= 0; i--) {
    if (evaluateCondition(state, objectives[i]!.completeWhen)) return objectives[i + 1] ?? null;
  }
  return objectives[0] ?? null;
}
