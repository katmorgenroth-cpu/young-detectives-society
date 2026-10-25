import { applyEffects, evaluateCondition, markHotspotExamined } from './state';
import type { GameState, Hotspot, Room } from './types';

export function visibleHotspots(room: Room, state: GameState): Hotspot[] {
  return room.hotspots.filter((h) => evaluateCondition(state, h.visibleWhen));
}

export interface ExamineResult {
  state: GameState;
  lines: string[];
  /** True the first time this hotspot is examined. */
  firstTime: boolean;
}

/** Examine a hotspot. Effects only apply on the first look, so repeat clicks are harmless. */
export function examineHotspot(state: GameState, hotspot: Hotspot): ExamineResult {
  if (!evaluateCondition(state, hotspot.visibleWhen)) {
    return { state, lines: [], firstTime: false };
  }
  const firstTime = !state.examinedHotspots.includes(hotspot.id);
  if (!firstTime) {
    return { state, lines: hotspot.repeatLook ?? hotspot.firstLook, firstTime };
  }
  const next = applyEffects(markHotspotExamined(state, hotspot.id), hotspot.effects);
  return { state: next, lines: hotspot.firstLook, firstTime };
}
