import { describe, expect, it } from 'vitest';
import { blackthornCase } from '../src/content/blackthorn/case';
import { validateCase } from '../src/core/validation';

describe('Blackthorn Manor chapter 1 content', () => {
  it('passes validation with no errors or warnings', () => {
    const report = validateCase(blackthornCase);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it('includes the five required drawing room hotspots', () => {
    const labels = blackthornCase.room.hotspots.map((h) => h.label.toLowerCase());
    for (const name of ['writing desk', 'stopped clock', 'portrait', 'fireplace', 'locked cabinet']) {
      expect(labels).toContain(name);
    }
  });

  it('has at least three hotspots that add clues to the journal', () => {
    const clueHotspots = blackthornCase.room.hotspots.filter((h) => h.effects?.some((e) => e.type === 'giveEvidence'));
    expect(clueHotspots.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps every lie consistent with canon: only the deduction answer is marked untrue', () => {
    const lies = blackthornCase.statements.filter((s) => !s.truthful).map((s) => s.id);
    expect(lies).toEqual(['s_quill_never']);
  });
});
