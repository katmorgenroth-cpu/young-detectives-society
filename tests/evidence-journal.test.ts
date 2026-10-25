import { describe, expect, it } from 'vitest';
import { blackthornCase } from '../src/content/blackthorn/case';
import { visibleHotspots } from '../src/core/hotspots';
import { buildJournal } from '../src/core/journal';
import { hotspot, newSession, tree } from './helpers';

describe('collecting and reviewing evidence', () => {
  it('starts with an empty journal', () => {
    const { session } = newSession();
    const journal = buildJournal(session.state, blackthornCase);
    expect(journal.isEmpty).toBe(true);
    expect(journal.evidence).toEqual([]);
  });

  it('adds a clue to the journal when a hotspot is examined', () => {
    const { session } = newSession();
    const result = session.examine(hotspot('hs_desk'));
    expect(result.firstTime).toBe(true);
    expect(result.lines.length).toBeGreaterThan(0);

    const journal = buildJournal(session.state, blackthornCase);
    expect(journal.evidence.map((e) => e.name)).toEqual(['Black Ink Only']);
    expect(journal.evidence[0]!.description).toMatch(/black ink/);
  });

  it('lists clues in the order they were found and never duplicates them', () => {
    const { session } = newSession();
    session.examine(hotspot('hs_clock'));
    session.examine(hotspot('hs_portrait'));
    session.examine(hotspot('hs_clock'));
    session.examine(hotspot('hs_desk'));
    const ids = buildJournal(session.state, blackthornCase).evidence.map((e) => e.id);
    expect(ids).toEqual(['ev_stopped_clock', 'ev_hidden_key', 'ev_black_ink']);
  });

  it('shows the shorter repeat text on a second look', () => {
    const { session } = newSession();
    session.examine(hotspot('hs_clock'));
    const again = session.examine(hotspot('hs_clock'));
    expect(again.firstTime).toBe(false);
    expect(again.lines).toEqual(hotspot('hs_clock').repeatLook);
  });

  it('hides the fingerprints until the cabinet has been examined', () => {
    const { session } = newSession();
    const before = visibleHotspots(blackthornCase.room, session.state).map((h) => h.id);
    expect(before).not.toContain('hs_fingerprint');
    // Clicking a hidden hotspot does nothing.
    expect(session.examine(hotspot('hs_fingerprint')).lines).toEqual([]);
    expect(session.state.evidence).not.toContain('ev_violet_print');

    session.examine(hotspot('hs_cabinet'));
    const after = visibleHotspots(blackthornCase.room, session.state).map((h) => h.id);
    expect(after).toContain('hs_fingerprint');
  });

  it('records statements under the person who said them', () => {
    const { session } = newSession();
    session.talk(tree('pembroke'), 'pb_start');
    session.talk(tree('pembroke'), 'pb_where');
    const journal = buildJournal(session.state, blackthornCase);
    expect(journal.people.map((p) => p.character.id)).toEqual(['pembroke']);
    expect(journal.people[0]!.statements.map((s) => s.id)).toEqual(['s_pembroke_pantry']);
  });
});
