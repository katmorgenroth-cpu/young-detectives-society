import type {
  CaseData,
  Condition,
  DeductionId,
  Effect,
  GameState,
  HotspotId,
  DialogueNodeId,
} from './types';

export function createInitialState(caseData: CaseData): GameState {
  return {
    caseId: caseData.id,
    evidence: [],
    statements: [],
    flags: [],
    examinedHotspots: [],
    visitedDialogueNodes: [],
    solvedDeductions: [],
    hintsRevealed: {},
    deductionAttempts: {},
    introSeen: false,
  };
}

function addUnique<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? [...list] : [...list, value];
}

export function evaluateCondition(state: GameState, condition: Condition | undefined): boolean {
  if (!condition) return true;
  switch (condition.type) {
    case 'hasEvidence':
      return state.evidence.includes(condition.id);
    case 'hasStatement':
      return state.statements.includes(condition.id);
    case 'flag':
      return state.flags.includes(condition.id);
    case 'notFlag':
      return !state.flags.includes(condition.id);
    case 'deductionSolved':
      return state.solvedDeductions.includes(condition.id);
    case 'all':
      return condition.of.every((c) => evaluateCondition(state, c));
    case 'any':
      return condition.of.some((c) => evaluateCondition(state, c));
  }
}

export function applyEffect(state: GameState, effect: Effect): GameState {
  switch (effect.type) {
    case 'giveEvidence':
      return { ...state, evidence: addUnique(state.evidence, effect.id) };
    case 'recordStatement':
      return { ...state, statements: addUnique(state.statements, effect.id) };
    case 'setFlag':
      return { ...state, flags: addUnique(state.flags, effect.id) };
  }
}

export function applyEffects(state: GameState, effects: readonly Effect[] | undefined): GameState {
  return (effects ?? []).reduce(applyEffect, state);
}

export function markHotspotExamined(state: GameState, id: HotspotId): GameState {
  return { ...state, examinedHotspots: addUnique(state.examinedHotspots, id) };
}

export function markDialogueNodeVisited(state: GameState, id: DialogueNodeId): GameState {
  return { ...state, visitedDialogueNodes: addUnique(state.visitedDialogueNodes, id) };
}

export function markIntroSeen(state: GameState): GameState {
  return { ...state, introSeen: true };
}

export function markDeductionSolved(state: GameState, id: DeductionId): GameState {
  return { ...state, solvedDeductions: addUnique(state.solvedDeductions, id) };
}

export function recordDeductionAttempt(state: GameState, id: DeductionId): GameState {
  const attempts = (state.deductionAttempts[id] ?? 0) + 1;
  return { ...state, deductionAttempts: { ...state.deductionAttempts, [id]: attempts } };
}

export function isCaseComplete(state: GameState, caseData: CaseData): boolean {
  return state.flags.includes(caseData.completionFlag);
}
