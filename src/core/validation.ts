import { applyEffects, createInitialState, evaluateCondition, markDeductionSolved } from './state';
import type { CaseData, Condition, Effect, GameState } from './types';

export interface ValidationReport {
  errors: string[];
  warnings: string[];
}

/**
 * Static checks that a case is internally consistent and fairly solvable:
 * every reference points at something real, every clue the solution needs
 * can actually be found, and the deduction cannot be attempted without them.
 */
export function validateCase(data: CaseData): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const ids = {
    characters: new Set(data.characters.map((c) => c.id)),
    evidence: new Set(data.evidence.map((e) => e.id)),
    statements: new Set(data.statements.map((s) => s.id)),
    hotspots: new Set(data.room.hotspots.map((h) => h.id)),
    deductions: new Set(data.deductions.map((d) => d.id)),
  };

  const checkUnique = (label: string, list: { id: string }[]) => {
    const seen = new Set<string>();
    for (const { id } of list) {
      if (seen.has(id)) errors.push(`Duplicate ${label} id "${id}"`);
      seen.add(id);
    }
  };
  checkUnique('character', data.characters);
  checkUnique('evidence', data.evidence);
  checkUnique('statement', data.statements);
  checkUnique('hotspot', data.room.hotspots);
  checkUnique('deduction', data.deductions);
  checkUnique('dialogue node', data.dialogues.flatMap((t) => t.nodes));

  const checkCondition = (where: string, c: Condition | undefined) => {
    if (!c) return;
    switch (c.type) {
      case 'hasEvidence':
        if (!ids.evidence.has(c.id)) errors.push(`${where}: unknown evidence "${c.id}"`);
        break;
      case 'hasStatement':
        if (!ids.statements.has(c.id)) errors.push(`${where}: unknown statement "${c.id}"`);
        break;
      case 'deductionSolved':
        if (!ids.deductions.has(c.id)) errors.push(`${where}: unknown deduction "${c.id}"`);
        break;
      case 'all':
      case 'any':
        c.of.forEach((inner) => checkCondition(where, inner));
        break;
      case 'flag':
      case 'notFlag':
        break;
    }
  };

  const checkEffects = (where: string, effects: Effect[] | undefined) => {
    for (const e of effects ?? []) {
      if (e.type === 'giveEvidence' && !ids.evidence.has(e.id)) {
        errors.push(`${where}: gives unknown evidence "${e.id}"`);
      }
      if (e.type === 'recordStatement' && !ids.statements.has(e.id)) {
        errors.push(`${where}: records unknown statement "${e.id}"`);
      }
    }
  };

  for (const s of data.statements) {
    if (!ids.characters.has(s.speaker)) errors.push(`Statement "${s.id}": unknown speaker "${s.speaker}"`);
  }

  for (const h of data.room.hotspots) {
    checkCondition(`Hotspot "${h.id}"`, h.visibleWhen);
    checkEffects(`Hotspot "${h.id}"`, h.effects);
    if (h.firstLook.length === 0) errors.push(`Hotspot "${h.id}" has no text`);
    // Never require pixel-perfect clicking: keep targets comfortably large.
    if (h.area.width < 64 || h.area.height < 64) {
      errors.push(`Hotspot "${h.id}" is smaller than the 64px minimum click target`);
    }
  }

  for (const p of data.room.characters) {
    if (!ids.characters.has(p.character)) errors.push(`Room places unknown character "${p.character}"`);
    checkCondition(`Placement of "${p.character}"`, p.visibleWhen);
  }

  for (const tree of data.dialogues) {
    const where = `Dialogue for "${tree.character}"`;
    if (!ids.characters.has(tree.character)) errors.push(`${where}: unknown character`);
    if (!data.room.characters.some((p) => p.character === tree.character)) {
      warnings.push(`${where}: character is not placed in the room`);
    }
    const nodeIds = new Set(tree.nodes.map((n) => n.id));
    if (!nodeIds.has(tree.start)) errors.push(`${where}: start node "${tree.start}" missing`);
    for (const node of tree.nodes) {
      if (node.speaker !== 'detective' && !ids.characters.has(node.speaker)) {
        errors.push(`${where}, node "${node.id}": unknown speaker "${node.speaker}"`);
      }
      checkEffects(`${where}, node "${node.id}"`, node.effects);
      for (const choice of node.choices ?? []) {
        checkCondition(`${where}, node "${node.id}"`, choice.showWhen);
        if (choice.next !== null && !nodeIds.has(choice.next)) {
          errors.push(`${where}, node "${node.id}": choice leads to missing node "${choice.next}"`);
        }
      }
    }
    // Every node should be reachable from the start node.
    const reached = new Set<string>();
    const queue = [tree.start];
    while (queue.length > 0) {
      const id = queue.pop()!;
      if (reached.has(id)) continue;
      reached.add(id);
      const node = tree.nodes.find((n) => n.id === id);
      for (const c of node?.choices ?? []) if (c.next) queue.push(c.next);
    }
    for (const node of tree.nodes) {
      if (!reached.has(node.id)) warnings.push(`${where}: node "${node.id}" can never be reached`);
    }
  }

  // Simulate an ideal player who explores everything to find what is obtainable.
  const reachable = exploreEverything(data);

  for (const e of data.evidence) {
    if (!reachable.evidence.includes(e.id)) errors.push(`Evidence "${e.id}" can never be found`);
  }
  for (const s of data.statements) {
    if (!reachable.statements.includes(s.id)) warnings.push(`Statement "${s.id}" is never heard`);
  }

  for (const d of data.deductions) {
    const where = `Deduction "${d.id}"`;
    checkCondition(where, d.availableWhen);
    checkEffects(where, d.onSolved.effects);
    const { suspect, statement, evidence } = d.solution;
    const stmt = data.statements.find((s) => s.id === statement);
    if (!ids.characters.has(suspect)) errors.push(`${where}: unknown suspect "${suspect}"`);
    if (!stmt) errors.push(`${where}: unknown statement "${statement}"`);
    if (!ids.evidence.has(evidence)) errors.push(`${where}: unknown evidence "${evidence}"`);
    if (stmt && stmt.speaker !== suspect) {
      errors.push(`${where}: statement "${statement}" was not said by the suspect "${suspect}"`);
    }
    if (stmt && stmt.truthful) {
      errors.push(`${where}: canon marks "${statement}" as truthful, so it cannot be the contradiction`);
    }
    if (!d.supportingClues.evidence.includes(evidence)) {
      errors.push(`${where}: solution evidence "${evidence}" missing from supportingClues`);
    }
    if (!d.supportingClues.statements.includes(statement)) {
      errors.push(`${where}: solution statement "${statement}" missing from supportingClues`);
    }
    if (d.hints.length === 0) errors.push(`${where}: needs at least one hint`);
    for (const line of d.onSolved.lines) {
      if (line.speaker !== 'detective' && line.speaker !== 'narrator' && !ids.characters.has(line.speaker)) {
        errors.push(`${where}: unknown speaker "${line.speaker}" in solved scene`);
      }
    }

    if (!reachable.solvedDeductions.includes(d.id)) {
      errors.push(`${where}: can never become available`);
      continue;
    }
    // Fair play: the board must stay locked until every supporting clue is in hand.
    for (const clue of d.supportingClues.evidence) {
      const without: GameState = { ...reachable, evidence: reachable.evidence.filter((x) => x !== clue) };
      if (evaluateCondition(without, d.availableWhen)) {
        errors.push(`${where}: can be attempted without supporting evidence "${clue}"`);
      }
    }
    for (const clue of d.supportingClues.statements) {
      const without: GameState = { ...reachable, statements: reachable.statements.filter((x) => x !== clue) };
      if (evaluateCondition(without, d.availableWhen)) {
        errors.push(`${where}: can be attempted without supporting statement "${clue}"`);
      }
    }
  }

  checkUnique('objective', data.objectives);
  if (data.objectives.length === 0) errors.push('Case needs at least one objective');
  for (const o of data.objectives) {
    checkCondition(`Objective "${o.id}"`, o.completeWhen);
    if (!evaluateCondition(reachable, o.completeWhen)) errors.push(`Objective "${o.id}" can never be completed`);
  }

  if (!reachable.flags.includes(data.completionFlag)) {
    errors.push(`Completion flag "${data.completionFlag}" can never be set`);
  }

  return { errors, warnings };
}

/**
 * Repeatedly examine every visible hotspot, walk every dialogue branch and
 * solve every available deduction until nothing new is learned.
 * State only ever grows, so this always terminates.
 */
export function exploreEverything(data: CaseData): GameState {
  let state = createInitialState(data);
  const size = (s: GameState) =>
    s.evidence.length + s.statements.length + s.flags.length + s.solvedDeductions.length + s.visitedDialogueNodes.length;

  for (;;) {
    const before = size(state);

    for (const h of data.room.hotspots) {
      if (evaluateCondition(state, h.visibleWhen)) state = applyEffects(state, h.effects);
    }

    for (const tree of data.dialogues) {
      const placement = data.room.characters.find((p) => p.character === tree.character);
      if (!placement || !evaluateCondition(state, placement.visibleWhen)) continue;
      const seen = new Set<string>();
      const queue = [tree.start];
      while (queue.length > 0) {
        const id = queue.pop()!;
        if (seen.has(id)) continue;
        seen.add(id);
        const node = tree.nodes.find((n) => n.id === id);
        if (!node) continue;
        state = applyEffects(state, node.effects);
        if (!state.visitedDialogueNodes.includes(id)) {
          state = { ...state, visitedDialogueNodes: [...state.visitedDialogueNodes, id] };
        }
        for (const c of node.choices ?? []) {
          if (c.next && evaluateCondition(state, c.showWhen)) queue.push(c.next);
        }
      }
    }

    for (const d of data.deductions) {
      if (!state.solvedDeductions.includes(d.id) && evaluateCondition(state, d.availableWhen)) {
        state = applyEffects(markDeductionSolved(state, d.id), d.onSolved.effects);
      }
    }

    if (size(state) === before) return state;
  }
}
