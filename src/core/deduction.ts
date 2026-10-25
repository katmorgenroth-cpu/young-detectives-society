import { applyEffects, evaluateCondition, markDeductionSolved, recordDeductionAttempt } from './state';
import type { CharacterId, Deduction, EvidenceId, GameState, ScriptLine, StatementId } from './types';

export interface ContradictionAnswer {
  suspect: CharacterId;
  statement: StatementId;
  evidence: EvidenceId;
}

export type DeductionOutcome =
  | { result: 'locked' }
  | { result: 'alreadySolved' }
  | { result: 'correct'; lines: ScriptLine[] }
  | { result: 'incorrect'; feedback: string };

export function isDeductionAvailable(state: GameState, deduction: Deduction): boolean {
  return evaluateCondition(state, deduction.availableWhen);
}

/**
 * Check a player's answer. Feedback names the first part that is wrong,
 * in reading order (who, then what they said, then the proof), so the
 * player always learns something without being told the answer.
 */
export function submitContradiction(
  state: GameState,
  deduction: Deduction,
  answer: ContradictionAnswer,
): { state: GameState; outcome: DeductionOutcome } {
  if (state.solvedDeductions.includes(deduction.id)) {
    return { state, outcome: { result: 'alreadySolved' } };
  }
  if (!isDeductionAvailable(state, deduction)) {
    return { state, outcome: { result: 'locked' } };
  }
  // Players can only present things they actually have.
  if (!state.statements.includes(answer.statement) || !state.evidence.includes(answer.evidence)) {
    return { state, outcome: { result: 'locked' } };
  }

  const { solution, feedback } = deduction;
  let wrong: string | null = null;
  if (answer.suspect !== solution.suspect) wrong = feedback.wrongSuspect;
  else if (answer.statement !== solution.statement) wrong = feedback.wrongStatement;
  else if (answer.evidence !== solution.evidence) wrong = feedback.wrongEvidence;

  if (wrong !== null) {
    return {
      state: recordDeductionAttempt(state, deduction.id),
      outcome: { result: 'incorrect', feedback: wrong },
    };
  }

  const solved = applyEffects(markDeductionSolved(state, deduction.id), deduction.onSolved.effects);
  return { state: solved, outcome: { result: 'correct', lines: deduction.onSolved.lines } };
}
