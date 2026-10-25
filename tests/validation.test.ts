import { describe, expect, it } from 'vitest';
import { blackthornCase } from '../src/content/blackthorn/case';
import type { CaseData } from '../src/core/types';
import { validateCase } from '../src/core/validation';

/** Deep copy so each test can break the content without affecting others. */
const clone = (): CaseData => structuredClone(blackthornCase);

describe('validateCase catches broken content', () => {
  it('flags a hotspot that gives evidence which does not exist', () => {
    const data = clone();
    data.room.hotspots[0]!.effects = [{ type: 'giveEvidence', id: 'ev_missing' }];
    expect(validateCase(data).errors.join('\n')).toMatch(/unknown evidence "ev_missing"/);
  });

  it('flags evidence that can never be found', () => {
    const data = clone();
    data.room.hotspots = data.room.hotspots.filter((h) => h.id !== 'hs_desk');
    expect(validateCase(data).errors.join('\n')).toMatch(/Evidence "ev_black_ink" can never be found/);
  });

  it('flags a clue locked behind a prerequisite that can never be met', () => {
    const data = clone();
    const print = data.room.hotspots.find((h) => h.id === 'hs_fingerprint')!;
    print.visibleWhen = { type: 'flag', id: 'never_set' };
    const errors = validateCase(data).errors.join('\n');
    expect(errors).toMatch(/ev_violet_print" can never be found/);
    expect(errors).toMatch(/Deduction "d_quill_lie": can never become available/);
  });

  it('flags a deduction that could be attempted without its supporting clues', () => {
    const data = clone();
    data.deductions[0]!.availableWhen = { type: 'hasStatement', id: 's_quill_never' };
    expect(validateCase(data).errors.join('\n')).toMatch(/without supporting evidence "ev_violet_print"/);
  });

  it('flags a solution statement that canon says is true', () => {
    const data = clone();
    data.statements.find((s) => s.id === 's_quill_never')!.truthful = true;
    expect(validateCase(data).errors.join('\n')).toMatch(/cannot be the contradiction/);
  });

  it('flags a solution statement said by someone other than the suspect', () => {
    const data = clone();
    data.deductions[0]!.solution.suspect = 'pembroke';
    expect(validateCase(data).errors.join('\n')).toMatch(/was not said by the suspect/);
  });

  it('flags dialogue choices that lead nowhere', () => {
    const data = clone();
    data.dialogues[0]!.nodes[0]!.choices![0]!.next = 'la_nowhere';
    expect(validateCase(data).errors.join('\n')).toMatch(/missing node "la_nowhere"/);
  });

  it('flags hotspots too small to click comfortably', () => {
    const data = clone();
    data.room.hotspots[0]!.area.width = 20;
    expect(validateCase(data).errors.join('\n')).toMatch(/64px minimum/);
  });

  it('flags duplicate ids', () => {
    const data = clone();
    data.evidence.push({ ...data.evidence[0]! });
    expect(validateCase(data).errors.join('\n')).toMatch(/Duplicate evidence id/);
  });
});
