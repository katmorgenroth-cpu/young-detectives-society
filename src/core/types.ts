/**
 * Typed data structures shared by every case.
 *
 * Content (src/content/**) is plain data that conforms to these types.
 * Systems (src/core/**) operate on these types and never import content directly.
 */

export type EvidenceId = string;
export type CharacterId = string;
export type StatementId = string;
export type HotspotId = string;
export type DialogueNodeId = string;
export type FlagId = string;
export type DeductionId = string;

/** Something the detective can know or hold. */
export type EvidenceKind =
  /** A physical object the player picks up (the "inventory"). */
  | 'item'
  /** Something the player noticed but cannot carry. */
  | 'observation';

export interface Evidence {
  id: EvidenceId;
  kind: EvidenceKind;
  name: string;
  /** Child-friendly description shown in the journal. */
  description: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  /** Short role shown under the name, e.g. "The Butler". */
  role: string;
  /** One-line journal summary. */
  summary: string;
  /** Placeholder tint until real art exists. */
  color: number;
}

/**
 * Something a character says that is worth writing down.
 * Statements may be false, but every statement must be consistent with
 * the case canon: `truthful` records what the canon says about it.
 */
export interface Statement {
  id: StatementId;
  speaker: CharacterId;
  text: string;
  truthful: boolean;
}

/** Conditions gate hotspots, dialogue choices and deductions. */
export type Condition =
  | { type: 'hasEvidence'; id: EvidenceId }
  | { type: 'hasStatement'; id: StatementId }
  | { type: 'flag'; id: FlagId }
  | { type: 'notFlag'; id: FlagId }
  | { type: 'deductionSolved'; id: DeductionId }
  | { type: 'all'; of: Condition[] }
  | { type: 'any'; of: Condition[] };

/** A line in a short cutscene, such as a confession. */
export interface ScriptLine {
  speaker: CharacterId | 'detective' | 'narrator';
  text: string;
}

/** Side effects that content can trigger. */
export type Effect =
  | { type: 'giveEvidence'; id: EvidenceId }
  | { type: 'recordStatement'; id: StatementId }
  | { type: 'setFlag'; id: FlagId };

/** A rectangle in scene coordinates (1280x720 design space). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Hotspot {
  id: HotspotId;
  label: string;
  area: Rect;
  /** Hotspot is hidden and not clickable until this is true. */
  visibleWhen?: Condition;
  /** Lines shown the first time the hotspot is examined. */
  firstLook: string[];
  /** Lines shown on later visits. Falls back to firstLook. */
  repeatLook?: string[];
  effects?: Effect[];
}

export interface DialogueChoice {
  text: string;
  next: DialogueNodeId | null;
  showWhen?: Condition;
  /** Hide the choice once its target node has been visited. */
  once?: boolean;
}

export interface DialogueNode {
  id: DialogueNodeId;
  speaker: CharacterId | 'detective';
  lines: string[];
  effects?: Effect[];
  /** No choices means the conversation ends after this node. */
  choices?: DialogueChoice[];
}

export interface DialogueTree {
  character: CharacterId;
  start: DialogueNodeId;
  nodes: DialogueNode[];
}

export interface CharacterPlacement {
  character: CharacterId;
  area: Rect;
  visibleWhen?: Condition;
}

export interface Room {
  id: string;
  name: string;
  /** Placeholder background colours until real art exists. */
  wallColor: number;
  floorColor: number;
  hotspots: Hotspot[];
  characters: CharacterPlacement[];
}

/**
 * A contradiction deduction: the player chooses who is not telling the
 * truth, which statement is false, and which piece of evidence proves it.
 */
export interface ContradictionDeduction {
  id: DeductionId;
  type: 'contradiction';
  title: string;
  question: string;
  /** The deduction board stays locked until this is true. */
  availableWhen: Condition;
  solution: {
    suspect: CharacterId;
    statement: StatementId;
    evidence: EvidenceId;
  };
  /**
   * Every clue the player needs to reach the answer by reasoning rather
   * than guessing. Validation checks these are all obtainable and that
   * `availableWhen` requires them.
   */
  supportingClues: { evidence: EvidenceId[]; statements: StatementId[] };
  /** Graduated hints, gentlest first. */
  hints: string[];
  /** Gentle feedback for wrong answers, keyed by what was wrong. */
  feedback: {
    wrongSuspect: string;
    wrongStatement: string;
    wrongEvidence: string;
  };
  onSolved: { lines: ScriptLine[]; effects?: Effect[] };
}

export type Deduction = ContradictionDeduction;

/**
 * A step shown in the objective bar. The first objective whose
 * `completeWhen` is false is the current one. Text should point the
 * player somewhere useful without giving away the answer.
 */
export interface Objective {
  id: string;
  text: string;
  completeWhen: Condition;
}

/** The authored truth of the case. Used by validation and by writers. */
export interface CaseCanon {
  summary: string;
  timeline: { time: string; event: string }[];
}

export interface CaseData {
  id: string;
  /** Game title shown on the title screen. */
  title: string;
  /** Chapter name shown under the title. */
  chapter: string;
  intro: string[];
  canon: CaseCanon;
  characters: Character[];
  evidence: Evidence[];
  statements: Statement[];
  room: Room;
  dialogues: DialogueTree[];
  deductions: Deduction[];
  objectives: Objective[];
  /** Flag that marks the slice as complete. */
  completionFlag: FlagId;
  outro: string[];
}

/** Everything that changes during play. Plain JSON so it can be saved. */
export interface GameState {
  caseId: string;
  evidence: EvidenceId[];
  statements: StatementId[];
  flags: FlagId[];
  examinedHotspots: HotspotId[];
  visitedDialogueNodes: DialogueNodeId[];
  solvedDeductions: DeductionId[];
  /** How many hints the player has revealed per deduction. */
  hintsRevealed: Record<DeductionId, number>;
  /** Wrong attempts per deduction (never punished, only used for hint nudges). */
  deductionAttempts: Record<DeductionId, number>;
  introSeen: boolean;
}
