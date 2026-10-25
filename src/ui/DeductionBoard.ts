import Phaser from 'phaser';
import { isDeductionAvailable } from '../core/deduction';
import { hasMoreHints, revealedHints } from '../core/hints';
import type { GameSession } from '../core/session';
import type { CharacterId, Deduction, EvidenceId, ScriptLine, StatementId } from '../core/types';
import { Button } from './Button';
import type { Focusable } from './FocusManager';
import { colors, fonts, sizes, textColors } from './theme';

type Area = { x: number; y: number; width: number; height: number };

/**
 * "Solve the Mystery" tab. The player builds an answer in three small
 * steps (who, what they said, which clue proves it), then presents it.
 * Wrong answers get a gentle nudge; nothing is ever lost.
 */
export class DeductionBoard {
  private suspect: CharacterId | null = null;
  private statement: StatementId | null = null;
  private evidence: EvidenceId | null = null;
  private feedback: string | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly session: GameSession,
    private readonly onSolved: (lines: ScriptLine[]) => void,
  ) {}

  private get deduction(): Deduction {
    const d = this.session.caseData.deductions[0];
    if (!d) throw new Error('This case has no deduction');
    return d;
  }

  render(c: Phaser.GameObjects.Container, area: Area): Focusable[] {
    const s = this.scene;
    const d = this.deduction;
    const state = this.session.state;
    const focusables: Focusable[] = [];
    let y = area.y;

    const heading = s.add.text(area.x, y, d.title, {
      fontFamily: fonts.title, fontSize: `${sizes.heading}px`, color: textColors.dark, fontStyle: 'bold',
    });
    c.add(heading);
    y += heading.height + 6;

    const solved = state.solvedDeductions.includes(d.id);
    const question = s.add.text(area.x, y, solved ? 'You solved it! Professor Quill admitted he fibbed.' : d.question, {
      fontFamily: fonts.body, fontSize: `${sizes.body}px`, color: textColors.dark, wordWrap: { width: area.width - 290 }, lineSpacing: 6,
    });
    c.add(question);

    // Optional, graduated hints.
    if (!solved) {
      const hintButton = new Button(s, {
        x: area.x + area.width - 260,
        y: area.y,
        width: 260,
        height: 50,
        label: hasMoreHints(state, d) ? (revealedHints(state, d).length === 0 ? 'Need a hint?' : 'Another hint, please') : 'No more hints',
        variant: 'paper',
        fontSize: sizes.small,
        onClick: () => this.session.revealHint(d),
      }).setEnabled(hasMoreHints(state, d));
      c.add(hintButton);
      focusables.push(hintButton);
    }
    y += question.height + 12;

    const hints = revealedHints(state, d);
    if (!solved && hints.length > 0) {
      const latest = hints[hints.length - 1]!;
      const hint = s.add.text(area.x + 16, y + 10, `Hint ${hints.length} of ${d.hints.length}: ${latest}`, {
        fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: '#3d5a2e', fontStyle: 'italic', wordWrap: { width: area.width - 32 }, lineSpacing: 4,
      });
      const box = s.add.graphics();
      box.fillStyle(0xe7f0d8).fillRoundedRect(area.x, y, area.width, hint.height + 20, 10);
      c.add([box, hint]);
      y += hint.height + 32;
    }

    if (solved) return focusables;

    if (!isDeductionAvailable(state, d)) {
      const locked = s.add.text(area.x, y + 20, 'You need more clues before you can solve this.\nKeep exploring the room and asking everyone questions. Your objective at the top of the screen will help!', {
        fontFamily: fonts.body, fontSize: `${sizes.body}px`, color: textColors.mutedDark, wordWrap: { width: area.width }, lineSpacing: 8,
      });
      c.add(locked);
      return focusables;
    }

    // Step tracker: who › what › proof.
    const caseData = this.session.caseData;
    const step = this.suspect === null ? 1 : this.statement === null ? 2 : 3;
    const who = caseData.characters.find((ch) => ch.id === this.suspect);
    const said = caseData.statements.find((st) => st.id === this.statement);
    const tracker = [
      `1. Who? ${who ? who.name : '...'}`,
      `2. What did they say? ${said ? `"${said.text}"` : '...'}`,
    ].join('\n');
    const trackerText = s.add.text(area.x, y, tracker, {
      fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: textColors.dark, wordWrap: { width: area.width - 200 }, lineSpacing: 6,
    });
    c.add(trackerText);
    if (step > 1) {
      const back = new Button(s, {
        x: area.x + area.width - 180, y, width: 180, height: 50, label: '◀ Go back', variant: 'paper', fontSize: sizes.small,
        onClick: () => {
          if (this.statement !== null) this.statement = null;
          else this.suspect = null;
          this.evidence = null;
          this.feedback = null;
          this.redraw();
        },
      });
      c.add(back);
      focusables.push(back);
    }
    y += Math.max(trackerText.height, 50) + 16;

    const prompt = ['Who isn\'t telling the truth?', 'Which thing they said is not true?', 'Which clue proves it?'][step - 1]!;
    const promptText = s.add.text(area.x, y, prompt, {
      fontFamily: fonts.body, fontSize: `${sizes.body}px`, color: textColors.dark, fontStyle: 'bold',
    });
    c.add(promptText);
    y += promptText.height + 10;

    const options: { id: string; label: string }[] =
      step === 1
        ? caseData.characters.map((ch) => ({ id: ch.id, label: ch.name }))
        : step === 2
          ? caseData.statements
              .filter((st) => st.speaker === this.suspect && state.statements.includes(st.id))
              .map((st) => ({ id: st.id, label: `"${st.text}"` }))
          : state.evidence
              .map((id) => caseData.evidence.find((e) => e.id === id))
              .filter((e) => e !== undefined)
              .map((e) => ({ id: e.id, label: e.name }));

    if (options.length === 0) {
      const none = s.add.text(area.x, y, 'You haven\'t heard this person say anything important yet. Go back and pick someone else, or talk to them first.', {
        fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: textColors.mutedDark, wordWrap: { width: area.width },
      });
      c.add(none);
    }

    const columns = step === 2 ? 1 : 3;
    const gap = 12;
    const bw = (area.width - gap * (columns - 1)) / columns;
    let rowY = y;
    let rowH = 0;
    options.forEach((opt, i) => {
      const col = i % columns;
      if (col === 0 && i > 0) {
        rowY += rowH + 8;
        rowH = 0;
      }
      const b = new Button(s, {
        x: area.x + col * (bw + gap), y: rowY, width: bw, height: 50, label: opt.label, variant: 'paper', fontSize: sizes.small, alignLeft: step === 2,
        onClick: () => {
          this.feedback = null;
          if (step === 1) this.suspect = opt.id;
          else if (step === 2) this.statement = opt.id;
          else this.evidence = opt.id;
          this.redraw();
        },
      }).setSelected(step === 3 && this.evidence === opt.id);
      rowH = Math.max(rowH, b.buttonHeight);
      c.add(b);
      focusables.push(b);
    });
    y = rowY + rowH + 20;

    if (step === 3) {
      const present = new Button(s, {
        x: area.x + area.width - 300, y, width: 300, height: 56, label: 'Present the proof!',
        onClick: () => this.present(),
      }).setEnabled(this.evidence !== null);
      c.add(present);
      focusables.push(present);
    }
    if (this.feedback) {
      const fb = s.add.text(area.x, y + 4, this.feedback, {
        fontFamily: fonts.body, fontSize: `${sizes.small}px`, color: '#8a3a26', wordWrap: { width: area.width - 330 }, lineSpacing: 4,
      });
      const g = s.add.graphics();
      g.lineStyle(2, colors.attention).strokeRoundedRect(area.x - 8, y - 4, area.width - 316, fb.height + 16, 8);
      c.add([g, fb]);
    }
    return focusables;
  }

  private present(): void {
    if (!this.suspect || !this.statement || !this.evidence) return;
    const outcome = this.session.submitDeduction(this.deduction, {
      suspect: this.suspect,
      statement: this.statement,
      evidence: this.evidence,
    });
    if (outcome.result === 'correct') {
      this.onSolved(outcome.lines);
      return;
    }
    if (outcome.result === 'incorrect') {
      this.feedback = outcome.feedback;
      // Keep correct parts so the player only rethinks what was wrong.
      if (outcome.feedback === this.deduction.feedback.wrongSuspect) {
        this.suspect = null;
        this.statement = null;
      } else if (outcome.feedback === this.deduction.feedback.wrongStatement) {
        this.statement = null;
      }
      this.evidence = null;
    }
    this.redraw();
  }

  /** Ask the journal to rebuild. Set by the journal. */
  redraw: () => void = () => {};
}
