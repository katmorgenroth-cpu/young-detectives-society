import Phaser from 'phaser';
import { visibleHotspots } from '../core/hotspots';
import { currentObjective } from '../core/objectives';
import type { GameSession } from '../core/session';
import { evaluateCondition, isCaseComplete } from '../core/state';
import type { DialogueNode, DialogueTree, Hotspot, ScriptLine } from '../core/types';
import { availableChoices } from '../core/dialogue';
import { Button } from '../ui/Button';
import { DialoguePanel, type PanelLine } from '../ui/DialoguePanel';
import { FocusManager } from '../ui/FocusManager';
import { HotspotView } from '../ui/HotspotView';
import { JournalOverlay } from '../ui/JournalOverlay';
import { colors, depth, fonts, GAME_WIDTH, sizes, textColors } from '../ui/theme';
import { Toast } from '../ui/Toast';
import { paintCharacter } from './art/characters';
import { paintDrawingRoom } from './art/drawingRoom';
import { getSession } from './sessionRegistry';

/** The playable room: hotspots, people, objective bar, dialogue and journal. */
export class RoomScene extends Phaser.Scene {
  private session!: GameSession;
  private focus!: FocusManager;
  private dialogue!: DialoguePanel;
  private journal!: JournalOverlay;
  private toast!: Toast;
  private objectiveText!: Phaser.GameObjects.Text;
  private journalButton!: Button;
  private showAllButton!: Button;
  private showAll = false;
  private hotspotViews = new Map<string, HotspotView>();
  private personViews: HotspotView[] = [];
  private hudButtons: Button[] = [];
  private roomEnabled = true;

  constructor() {
    super('Room');
  }

  create(): void {
    this.session = getSession(this);
    this.hotspotViews = new Map();
    this.personViews = [];
    this.roomEnabled = true;
    const caseData = this.session.caseData;

    paintDrawingRoom(this);
    this.focus = new FocusManager(this);
    this.toast = new Toast(this);
    this.dialogue = new DialoguePanel(this, this.focus);
    this.journal = new JournalOverlay(this, this.session, this.focus, (lines) => this.playSolvedScene(lines));

    for (const hotspot of caseData.room.hotspots) {
      const view = new HotspotView(this, hotspot.area, hotspot.label, () => this.examine(hotspot), 'object');
      this.hotspotViews.set(hotspot.id, view);
    }
    for (const placement of caseData.room.characters) {
      const character = caseData.characters.find((c) => c.id === placement.character);
      const tree = caseData.dialogues.find((t) => t.character === placement.character);
      if (!character) continue;
      paintCharacter(this, character, placement.area).setDepth(depth.characters);
      const view = new HotspotView(this, placement.area, `Talk to ${character.name}`, () => tree && this.talk(tree, tree.start), 'person');
      this.personViews.push(view);
    }

    this.buildHud();
    this.focus.pushLayer('room', this.roomFocusables());

    const unsubscribe = this.session.onChange(() => this.refresh());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribe);
    this.input.keyboard?.on('keydown-J', () => {
      if (!this.dialogue.isOpen && !this.journal.isOpen) this.openJournal();
    });
    this.refresh();
    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (!this.session.state.introSeen) {
      this.dialogue.play(
        caseData.intro.map((text) => ({ name: null, text })),
        { onEnd: () => { this.dialogue.dismiss(); this.session.finishIntro(); }, onClose: () => this.session.finishIntro() },
      );
      this.setRoomEnabled(false);
    }
  }

  override update(): void {
    // Keep room input off whenever a panel is showing.
    this.setRoomEnabled(!this.dialogue.isOpen && !this.journal.isOpen);
  }

  private buildHud(): void {
    const bar = this.add.graphics().setDepth(depth.hud);
    bar.fillStyle(colors.panel, 0.96).fillRect(0, 0, GAME_WIDTH, 56);
    bar.lineStyle(2, colors.gold).lineBetween(0, 56, GAME_WIDTH, 56);
    this.add.text(20, 28, 'Goal:', {
      fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: textColors.gold, fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(depth.hud);
    this.objectiveText = this.add.text(82, 28, '', {
      fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: textColors.light, wordWrap: { width: 760 },
    }).setOrigin(0, 0.5).setDepth(depth.hud);

    this.showAllButton = new Button(this, {
      x: 870, y: 6, width: 200, height: 44, fontSize: 18,
      label: 'Show clickables',
      onClick: () => {
        this.showAll = !this.showAll;
        this.showAllButton.setLabel(this.showAll ? 'Hide clickables' : 'Show clickables').setSelected(this.showAll);
        this.refresh();
      },
    }).setDepth(depth.hud);
    this.journalButton = new Button(this, {
      x: 1084, y: 6, width: 180, height: 44, fontSize: 18,
      label: 'Journal (J)',
      onClick: () => this.openJournal(),
    }).setDepth(depth.hud);
    this.hudButtons = [this.showAllButton, this.journalButton];
  }

  private roomFocusables() {
    const items = [...this.hotspotViews.values(), ...this.personViews].sort((a, b) => a.x - b.x);
    return [...items, ...this.hudButtons];
  }

  private setRoomEnabled(enabled: boolean): void {
    if (enabled === this.roomEnabled) return;
    this.roomEnabled = enabled;
    for (const v of this.hotspotViews.values()) v.setEnabled(enabled);
    for (const v of this.personViews) v.setEnabled(enabled);
    for (const b of this.hudButtons) b.setEnabled(enabled);
  }

  /** Bring the room in line with the current game state. */
  private refresh(): void {
    const { state, caseData } = this.session;
    const visible = new Set(visibleHotspots(caseData.room, state).map((h) => h.id));
    for (const hotspot of caseData.room.hotspots) {
      const view = this.hotspotViews.get(hotspot.id)!;
      view.setVisible(visible.has(hotspot.id));
      view.setShowAll(this.showAll);
      view.setLabel(state.examinedHotspots.includes(hotspot.id) ? `${hotspot.label} ✓` : hotspot.label);
    }
    caseData.room.characters.forEach((p, i) => {
      this.personViews[i]?.setVisible(evaluateCondition(state, p.visibleWhen));
      this.personViews[i]?.setShowAll(this.showAll);
    });

    const objective = currentObjective(state, caseData);
    this.objectiveText.setText(
      objective ? objective.text : isCaseComplete(state, caseData) ? 'Chapter complete! Well done, detective.' : 'Keep investigating!',
    );
  }

  private examine(hotspot: Hotspot): void {
    const before = new Set(this.session.state.evidence);
    const result = this.session.examine(hotspot);
    if (result.lines.length === 0) return;
    const found = this.session.state.evidence.filter((id) => !before.has(id));
    this.dialogue.play(
      result.lines.map((text) => ({ name: hotspot.label, text })),
      { onEnd: () => this.dialogue.close() },
    );
    for (const id of found) {
      const ev = this.session.caseData.evidence.find((e) => e.id === id);
      if (ev) this.toast.show(`New clue: ${ev.name}`, 'Added to your journal');
    }
    this.warnIfNotSaving();
  }

  private talk(tree: DialogueTree, nodeId: string): void {
    const result = this.session.talk(tree, nodeId);
    const lines = this.linesFor(result.node);
    const choices = availableChoices(this.session.state, result.node).map((choice) => ({
      text: choice.text,
      onPick: () => (choice.next ? this.talk(tree, choice.next) : this.dialogue.close()),
    }));
    this.dialogue.play(lines, choices.length > 0 ? { choices } : { onEnd: () => this.dialogue.close() });
    this.warnIfNotSaving();
  }

  private linesFor(node: DialogueNode): PanelLine[] {
    return node.lines.map((text) => ({ name: this.speakerName(node.speaker), text }));
  }

  private speakerName(speaker: string): string | null {
    if (speaker === 'detective') return 'You';
    if (speaker === 'narrator') return null;
    return this.session.caseData.characters.find((c) => c.id === speaker)?.name ?? null;
  }

  private openJournal(): void {
    this.journal.open();
  }

  private playSolvedScene(lines: ScriptLine[]): void {
    const caseData = this.session.caseData;
    const script: PanelLine[] = [
      ...lines.map((l) => ({ name: this.speakerName(l.speaker), text: l.text })),
      ...caseData.outro.map((text) => ({ name: null, text })),
    ];
    this.dialogue.play(script, {
      choices: [
        { text: 'Keep exploring the room', onPick: () => this.dialogue.close() },
        { text: 'Back to the title screen', onPick: () => { this.dialogue.dismiss(); this.scene.start('Title'); } },
      ],
    });
  }

  private warnIfNotSaving(): void {
    if (!this.session.saveOk) {
      this.toast.show('Your progress can\'t be saved', 'This browser is blocking saving. You can still play!');
    }
  }
}
