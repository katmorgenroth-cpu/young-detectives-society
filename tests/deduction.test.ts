import { describe, expect, it } from 'vitest';
import { blackthornCase } from '../src/content/blackthorn/case';
import { isDeductionAvailable } from '../src/core/deduction';
import { hasMoreHints, revealedHints } from '../src/core/hints';
import { currentObjective } from '../src/core/objectives';
import { isCaseComplete } from '../src/core/state';
import { gatherDeductionClues, newSession, tree } from './helpers';

const deduction = blackthornCase.deductions[0]!;

describe('the Professor Quill deduction', () => {
  it('is locked until every supporting clue is found', () => {
    const { session } = newSession();
    expect(isDeductionAvailable(session.state, deduction)).toBe(false);
    const outcome = session.submitDeduction(deduction, deduction.solution);
    expect(outcome.result).toBe('locked');
    gatherDeductionClues(session);
    expect(isDeductionAvailable(session.state, deduction)).toBe(true);
  });

  it('gives gentle, specific feedback for each kind of wrong answer', () => {
    const { session } = newSession();
    gatherDeductionClues(session);
    session.talk(tree('pembroke'), 'pb_start');
    session.talk(tree('pembroke'), 'pb_where');

    const wrongSuspect = session.submitDeduction(deduction, {
      suspect: 'pembroke', statement: 's_pembroke_pantry', evidence: 'ev_violet_print',
    });
    expect(wrongSuspect).toEqual({ result: 'incorrect', feedback: deduction.feedback.wrongSuspect });

    const wrongStatement = session.submitDeduction(deduction, {
      suspect: 'quill', statement: 's_quill_violet', evidence: 'ev_violet_print',
    });
    expect(wrongStatement).toEqual({ result: 'incorrect', feedback: deduction.feedback.wrongStatement });

    const wrongEvidence = session.submitDeduction(deduction, {
      suspect: 'quill', statement: 's_quill_never', evidence: 'ev_black_ink',
    });
    expect(wrongEvidence).toEqual({ result: 'incorrect', feedback: deduction.feedback.wrongEvidence });

    expect(session.state.deductionAttempts[deduction.id]).toBe(3);
    expect(session.state.solvedDeductions).toEqual([]);
  });

  it('rejects evidence the player has not found yet', () => {
    const { session } = newSession();
    gatherDeductionClues(session);
    const outcome = session.submitDeduction(deduction, { ...deduction.solution, evidence: 'ev_hidden_key' });
    expect(outcome.result).toBe('locked');
  });

  it('solves the case with the right answer and completes the chapter', () => {
    const { session } = newSession();
    gatherDeductionClues(session);
    const outcome = session.submitDeduction(deduction, deduction.solution);
    expect(outcome.result).toBe('correct');
    expect(isCaseComplete(session.state, blackthornCase)).toBe(true);
    expect(currentObjective(session.state, blackthornCase)).toBeNull();
    expect(session.submitDeduction(deduction, deduction.solution).result).toBe('alreadySolved');
  });

  it('reveals hints one at a time, gentlest first', () => {
    const { session } = newSession();
    expect(revealedHints(session.state, deduction)).toEqual([]);
    session.revealHint(deduction);
    expect(revealedHints(session.state, deduction)).toEqual([deduction.hints[0]]);
    for (let i = 0; i < 10; i++) session.revealHint(deduction);
    expect(revealedHints(session.state, deduction)).toEqual(deduction.hints);
    expect(hasMoreHints(session.state, deduction)).toBe(false);
  });
});

describe('objectives', () => {
  it('guides the player step by step without naming the answer', () => {
    const { session } = newSession();
    expect(currentObjective(session.state, blackthornCase)?.id).toBe('o_meet_lady');
    session.talk(tree('lady_blackthorn'), 'la_start');
    expect(currentObjective(session.state, blackthornCase)?.id).toBe('o_cabinet');
    gatherDeductionClues(session);
    expect(currentObjective(session.state, blackthornCase)?.id).toBe('o_deduce');
    for (const o of blackthornCase.objectives) {
      expect(o.text).not.toMatch(/quill|violet/i);
    }
  });
});

describe('objectives out of order', () => {
  it('moves on to the next step when the player skips ahead', () => {
    const { session } = newSession();
    session.talk(tree('pembroke'), 'pb_start');
    gatherDeductionClues(session); // never spoke to Lady Blackthorn
    expect(currentObjective(session.state, blackthornCase)?.id).toBe('o_deduce');
  });
});
