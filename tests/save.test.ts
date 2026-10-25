import { describe, expect, it } from 'vitest';
import { blackthornCase } from '../src/content/blackthorn/case';
import { deserialize, saveKey, serialize, type SaveStorage } from '../src/core/save';
import { GameSession, MemoryStorage } from '../src/core/session';
import { createInitialState } from '../src/core/state';
import { hotspot, newSession, tree } from './helpers';

describe('save and load', () => {
  it('autosaves and restores progress exactly', () => {
    const { session, storage } = newSession();
    session.examine(hotspot('hs_desk'));
    session.talk(tree('quill'), 'pq_start');
    session.finishIntro();

    const { session: restored, result } = GameSession.load(blackthornCase, storage);
    expect(result.status).toBe('loaded');
    expect(restored.state).toEqual(session.state);
  });

  it('starts fresh when there is no save', () => {
    const { result } = GameSession.load(blackthornCase, new MemoryStorage());
    expect(result.status).toBe('empty');
    expect(result.state).toEqual(createInitialState(blackthornCase));
  });

  it('recovers from a damaged save without crashing', () => {
    for (const raw of ['{not json', 'null', '{"version":99}', JSON.stringify({ version: 1, state: { caseId: 'blackthorn-ch1' } })]) {
      const result = deserialize(raw, blackthornCase);
      expect(result.status).toBe('corrupt');
      expect(result.state).toEqual(createInitialState(blackthornCase));
    }
  });

  it('drops ids that no longer exist in the content', () => {
    const state = { ...createInitialState(blackthornCase), evidence: ['ev_black_ink', 'ev_removed_clue'] };
    const result = deserialize(serialize(state), blackthornCase);
    expect(result.state.evidence).toEqual(['ev_black_ink']);
  });

  it('keeps playing if the browser refuses to save', () => {
    const broken: SaveStorage = {
      getItem: () => null,
      setItem: () => { throw new Error('QuotaExceeded'); },
      removeItem: () => {},
    };
    const session = new GameSession(blackthornCase, broken);
    session.examine(hotspot('hs_desk'));
    expect(session.saveOk).toBe(false);
    expect(session.state.evidence).toContain('ev_black_ink');
  });

  it('restart clears the save and progress', () => {
    const { session, storage } = newSession();
    session.examine(hotspot('hs_desk'));
    session.restart();
    expect(session.state).toEqual(createInitialState(blackthornCase));
    expect(JSON.parse(storage.getItem(saveKey(blackthornCase.id))!).state.evidence).toEqual([]);
  });
});
