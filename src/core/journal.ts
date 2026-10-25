import type { CaseData, Character, Evidence, GameState, Statement } from './types';

export interface JournalCharacterEntry {
  character: Character;
  /** Statements heard from this character, in the order they were heard. */
  statements: Statement[];
}

export interface JournalView {
  /** Evidence in the order it was found. */
  evidence: Evidence[];
  /** Only characters the player has spoken with, in case order. */
  people: JournalCharacterEntry[];
  isEmpty: boolean;
}

/** Build what the journal shows from the current state. Pure, so it is easy to test. */
export function buildJournal(state: GameState, caseData: CaseData): JournalView {
  const evidence = state.evidence
    .map((id) => caseData.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => e !== undefined);

  const heard = state.statements
    .map((id) => caseData.statements.find((s) => s.id === id))
    .filter((s): s is Statement => s !== undefined);

  const metIds = new Set<string>();
  for (const tree of caseData.dialogues) {
    if (state.visitedDialogueNodes.includes(tree.start)) metIds.add(tree.character);
  }

  const people = caseData.characters
    .filter((c) => metIds.has(c.id))
    .map((character) => ({ character, statements: heard.filter((s) => s.speaker === character.id) }));

  return { evidence, people, isEmpty: evidence.length === 0 && people.length === 0 };
}
