import { describe, expect, it } from 'vitest';
import { availableChoices, DialogueError, enterNode } from '../src/core/dialogue';
import { createInitialState } from '../src/core/state';
import { blackthornCase } from '../src/content/blackthorn/case';
import { hotspot, newSession, tree } from './helpers';

const texts = (choices: { text: string }[]) => choices.map((c) => c.text);

describe('dialogue', () => {
  it('only offers evidence-based questions once the evidence is found', () => {
    const { session } = newSession();
    let result = session.talk(tree('pembroke'), 'pb_start');
    expect(texts(result.choices)).not.toContain('Is this your button?');

    session.examine(hotspot('hs_button'));
    result = session.talk(tree('pembroke'), 'pb_start');
    expect(texts(result.choices)).toContain('Is this your button?');
  });

  it('hides a question once it has been asked', () => {
    const { session } = newSession();
    session.talk(tree('quill'), 'pq_start');
    const hub = session.talk(tree('quill'), 'pq_where');
    expect(hub.state.statements).toContain('s_quill_never');
    const back = session.talk(tree('quill'), 'pq_hub');
    expect(texts(back.choices)).not.toContain('Where were you last night?');
    expect(texts(back.choices)).toContain('Goodbye.');
  });

  it('always leaves a way out of every conversation', () => {
    const state = createInitialState(blackthornCase);
    for (const t of blackthornCase.dialogues) {
      for (const node of t.nodes) {
        const choices = availableChoices(state, node);
        // Either the node ends the conversation, or there is a choice to continue.
        expect(choices.length > 0 || (node.choices ?? []).length === 0).toBe(true);
      }
    }
  });

  it('throws a clear error for a missing node', () => {
    const state = createInitialState(blackthornCase);
    expect(() => enterNode(state, tree('quill'), 'nope')).toThrow(DialogueError);
  });
});
