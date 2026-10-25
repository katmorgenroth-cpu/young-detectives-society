import Phaser from 'phaser';
import { buildJournal } from '../core/journal';
import type { GameSession } from '../core/session';
import { Button } from './Button';
import { DeductionBoard } from './DeductionBoard';
import type { Focusable, FocusManager } from './FocusManager';
import { colors, depth, fonts, GAME_HEIGHT, GAME_WIDTH, sizes, textColors } from './theme';

type Tab = 'clues' | 'people' | 'solve';

const LAYER = 'journal';
const PAGE = { x: 50, y: 30, width: GAME_WIDTH - 100, height: GAME_HEIGHT - 60 };
/** Area below the tabs where each tab draws its contents. */
export const JOURNAL_BODY = { x: PAGE.x + 30, y: PAGE.y + 140, width: PAGE.width - 60, height: PAGE.height - 170 };

/**
 * The detective's journal: review clues, what people said, and solve the
 * deduction. Rebuilt from game state every time it changes.
 */
export class JournalOverlay {
  private readonly root: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Container | null = null;
  private tab: Tab = 'clues';
  private selectedClue: string | null = null;
  private selectedPerson: string | null = null;
  private readonly board: DeductionBoard;
  private unsubscribe: (() => void) | null = null;
  isOpen = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly focus: FocusManager,
    /** Called when the deduction is solved, after the journal closes. */
    private readonly onSolved: (lines: { speaker: string; text: string }[]) => void,
  ) {
    this.root = scene.add.container(0, 0).setDepth(depth.journal).setVisible(false);
    this.board = new DeductionBoard(scene, session, (lines) => {
      this.close();
      this.onSolved(lines);
    });
    this.board.redraw = () => this.render();
  }

  open(tab?: Tab): void {
    if (tab) this.tab = tab;
    this.isOpen = true;
    this.root.setVisible(true);
    this.focus.pushLayer(LAYER, [], () => this.close());
    this.unsubscribe = this.session.onChange(() => this.render());
    this.render();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.root.setVisible(false);
    this.root.removeAll(true);
    this.body = null;
    this.focus.popLayer(LAYER);
  }

  private render(): void {
    this.root.removeAll(true);
    const s = this.scene;

    const shade = s.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6).setOrigin(0, 0).setInteractive();
    const page = s.add.graphics();
    page.fillStyle(0x3a271d).fillRoundedRect(PAGE.x - 12, PAGE.y - 12, PAGE.width + 24, PAGE.height + 24, 20);
    page.fillStyle(colors.paper).fillRoundedRect(PAGE.x, PAGE.y, PAGE.width, PAGE.height, 14);
    page.lineStyle(2, colors.gold).strokeRoundedRect(PAGE.x + 10, PAGE.y + 10, PAGE.width - 20, PAGE.height - 20, 10);
    const title = s.add.text(PAGE.x + 30, PAGE.y + 22, "Detective's Journal", {
      fontFamily: fonts.title,
      fontSize: '36px',
      color: textColors.dark,
      fontStyle: 'bold',
    });
    this.root.add([shade, page, title]);

    const focusables: Focusable[] = [];
    const tabs: [Tab, string][] = [
      ['clues', 'Clues'],
      ['people', 'People'],
      ['solve', 'Solve the Mystery'],
    ];
    let tx = PAGE.x + 30;
    for (const [id, label] of tabs) {
      const width = id === 'solve' ? 250 : 150;
      const b = new Button(s, {
        x: tx,
        y: PAGE.y + 76,
        width,
        height: 50,
        label,
        variant: 'paper',
        fontSize: sizes.small,
        onClick: () => {
          this.tab = id;
          this.render();
        },
      }).setSelected(this.tab === id);
      this.root.add(b);
      focusables.push(b);
      tx += width + 12;
    }

    const back = new Button(s, {
      x: PAGE.x + PAGE.width - 230,
      y: PAGE.y + 24,
      width: 200,
      height: 52,
      label: '✕ Back to room',
      fontSize: sizes.small,
      onClick: () => this.close(),
    });
    this.root.add(back);

    this.body = s.add.container(0, 0);
    this.root.add(this.body);
    if (this.tab === 'clues') focusables.push(...this.renderClues(this.body));
    else if (this.tab === 'people') focusables.push(...this.renderPeople(this.body));
    else focusables.push(...this.board.render(this.body, JOURNAL_BODY));

    focusables.push(back);
    this.focus.setItems(LAYER, focusables);
  }

  private renderClues(c: Phaser.GameObjects.Container): Focusable[] {
    const journal = buildJournal(this.session.state, this.session.caseData);
    if (journal.evidence.length === 0) {
      c.add(emptyState(this.scene, 'No clues yet!', 'Go back to the room and click on things that look interesting. Clues you find will appear here.'));
      return [];
    }
    if (!this.selectedClue || !journal.evidence.some((e) => e.id === this.selectedClue)) {
      this.selectedClue = journal.evidence[journal.evidence.length - 1]!.id;
    }
    const buttons = journal.evidence.map((e, i) => {
      const b = new Button(this.scene, {
        x: JOURNAL_BODY.x,
        y: JOURNAL_BODY.y + i * 62,
        width: 340,
        height: 54,
        label: e.name,
        alignLeft: true,
        variant: 'paper',
        fontSize: sizes.small,
        onClick: () => {
          this.selectedClue = e.id;
          this.render();
        },
      }).setSelected(e.id === this.selectedClue);
      c.add(b);
      return b;
    });

    const clue = journal.evidence.find((e) => e.id === this.selectedClue)!;
    const dx = JOURNAL_BODY.x + 380;
    const dw = JOURNAL_BODY.width - 380;
    c.add(detailCard(this.scene, dx, JOURNAL_BODY.y, dw, [
      { text: clue.name, style: 'heading' },
      { text: clue.kind === 'item' ? 'An item in your pocket' : 'Something you noticed', style: 'muted' },
      { text: clue.description, style: 'body' },
    ]));
    return buttons;
  }

  private renderPeople(c: Phaser.GameObjects.Container): Focusable[] {
    const journal = buildJournal(this.session.state, this.session.caseData);
    if (journal.people.length === 0) {
      c.add(emptyState(this.scene, 'No one to write about yet.', 'Click on a person in the room to talk to them. What they tell you will be written here.'));
      return [];
    }
    if (!this.selectedPerson || !journal.people.some((p) => p.character.id === this.selectedPerson)) {
      this.selectedPerson = journal.people[0]!.character.id;
    }
    const buttons = journal.people.map((p, i) => {
      const b = new Button(this.scene, {
        x: JOURNAL_BODY.x,
        y: JOURNAL_BODY.y + i * 62,
        width: 340,
        height: 54,
        label: p.character.name,
        alignLeft: true,
        variant: 'paper',
        fontSize: sizes.small,
        onClick: () => {
          this.selectedPerson = p.character.id;
          this.render();
        },
      }).setSelected(p.character.id === this.selectedPerson);
      c.add(b);
      return b;
    });

    const person = journal.people.find((p) => p.character.id === this.selectedPerson)!;
    const said =
      person.statements.length > 0
        ? person.statements.map((st) => `•  "${st.text}"`)
        : ['They haven\'t told you anything important yet. Try asking them some questions.'];
    c.add(detailCard(this.scene, JOURNAL_BODY.x + 380, JOURNAL_BODY.y, JOURNAL_BODY.width - 380, [
      { text: person.character.name, style: 'heading' },
      { text: person.character.role, style: 'muted' },
      { text: person.character.summary, style: 'body' },
      { text: 'What they told you:', style: 'subheading' },
      ...said.map((text) => ({ text, style: 'body' as const })),
    ]));
    return buttons;
  }
}

type CardLine = { text: string; style: 'heading' | 'subheading' | 'muted' | 'body' };

function detailCard(scene: Phaser.Scene, x: number, y: number, width: number, lines: CardLine[]): Phaser.GameObjects.Container {
  const c = scene.add.container(0, 0);
  const pad = 24;
  let cy = y + pad;
  const texts = lines.map((line) => {
    const size = line.style === 'heading' ? sizes.heading : line.style === 'subheading' ? sizes.body : line.style === 'muted' ? sizes.small : sizes.body;
    const t = scene.add.text(x + pad, cy, line.text, {
      fontFamily: line.style === 'heading' ? fonts.title : fonts.body,
      fontSize: `${size}px`,
      color: line.style === 'muted' ? textColors.mutedDark : textColors.dark,
      fontStyle: line.style === 'heading' || line.style === 'subheading' ? 'bold' : 'normal',
      wordWrap: { width: width - pad * 2 },
      lineSpacing: 6,
    });
    cy += t.height + (line.style === 'heading' ? 6 : 14);
    return t;
  });
  const g = scene.add.graphics();
  g.fillStyle(0xfffaf0).fillRoundedRect(x, y, width, Math.max(200, cy - y + pad - 14), 12);
  g.lineStyle(2, colors.paperDark).strokeRoundedRect(x, y, width, Math.max(200, cy - y + pad - 14), 12);
  c.add([g, ...texts]);
  return c;
}

export function emptyState(scene: Phaser.Scene, heading: string, detail: string): Phaser.GameObjects.Container {
  const cx = JOURNAL_BODY.x + JOURNAL_BODY.width / 2;
  const h = scene.add.text(cx, JOURNAL_BODY.y + 80, heading, {
    fontFamily: fonts.title,
    fontSize: `${sizes.heading}px`,
    color: textColors.dark,
    fontStyle: 'bold',
  }).setOrigin(0.5, 0);
  const d = scene.add.text(cx, JOURNAL_BODY.y + 130, detail, {
    fontFamily: fonts.body,
    fontSize: `${sizes.body}px`,
    color: textColors.mutedDark,
    align: 'center',
    wordWrap: { width: 700 },
    lineSpacing: 6,
  }).setOrigin(0.5, 0);
  return scene.add.container(0, 0, [h, d]);
}
