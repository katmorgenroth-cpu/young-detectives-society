import { applyEffects, evaluateCondition, markDialogueNodeVisited } from './state';
import type { DialogueChoice, DialogueNode, DialogueNodeId, DialogueTree, GameState } from './types';

export class DialogueError extends Error {}

export function findNode(tree: DialogueTree, id: DialogueNodeId): DialogueNode {
  const node = tree.nodes.find((n) => n.id === id);
  if (!node) throw new DialogueError(`Dialogue node "${id}" not found for ${tree.character}`);
  return node;
}

/** Choices the player can currently pick at this node. */
export function availableChoices(state: GameState, node: DialogueNode): DialogueChoice[] {
  return (node.choices ?? []).filter((choice) => {
    if (!evaluateCondition(state, choice.showWhen)) return false;
    if (choice.once && choice.next && state.visitedDialogueNodes.includes(choice.next)) return false;
    return true;
  });
}

export interface NodeResult {
  state: GameState;
  node: DialogueNode;
  choices: DialogueChoice[];
}

/** Enter a node: record the visit, apply its effects, and list follow-up choices. */
export function enterNode(state: GameState, tree: DialogueTree, id: DialogueNodeId): NodeResult {
  const node = findNode(tree, id);
  const next = applyEffects(markDialogueNodeVisited(state, node.id), node.effects);
  return { state: next, node, choices: availableChoices(next, node) };
}
