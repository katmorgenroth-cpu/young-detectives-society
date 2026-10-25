# The Curious Case of Blackthorn Manor

A 2D point-and-click detective adventure for children aged 8–12, set in a fictional Victorian England.
Built with Phaser 3, TypeScript and Vite. Runs in the browser.

This repository currently holds a **vertical slice**: Chapter One, set in the manor's drawing room.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (first time only) |
| `npm run dev` | Start the game at http://localhost:5173 with live reload |
| `npm test` | Run the automated tests (Vitest) |
| `npm run typecheck` | Check TypeScript types |
| `npm run build` | Type check, then build a static site into `dist/` |
| `npm run preview` | Serve the built `dist/` folder |

## How to play the slice

1. Click **Start Investigation** on the title screen.
2. Read the introduction (or press **Back to room**).
3. Click or tap things in the room. Hovering, tapping or keyboard focus shows a glowing outline and a name tag.
   **Show clickables** (top right) outlines everything you can examine, which helps on tablets.
4. Talk to Lady Blackthorn, Mr. Pembroke and Professor Quill. The **Goal** bar at the top suggests what to do next.
5. Open the **Journal** (button or `J` key) to review clues and what people told you.
6. When you have enough clues, use **Solve the Mystery** in the journal. Hints are optional and free.

Keyboard: `Tab` / arrow keys move focus, `Enter` / `Space` choose, `Esc` goes back to the room.
Progress saves automatically in the browser (localStorage). **Start Over** on the title screen erases it.

## Project layout

```
src/
  core/        Game systems. Pure TypeScript, no Phaser, fully unit-tested.
    types.ts       Typed data model: evidence, characters, statements, dialogue, hotspots, deductions, objectives, game state
    state.ts       Conditions, effects and state updates (immutable)
    hotspots.ts    Examining objects
    dialogue.ts    Conversation trees with conditional choices
    deduction.ts   Checking a contradiction deduction
    hints.ts       Graduated hints
    objectives.ts  The "Goal" shown at the top of the screen
    journal.ts     What the journal shows, built from state
    save.ts        Versioned save/load with recovery from damaged saves
    session.ts     Owns the game state during play; autosaves every change
    validation.ts  Checks a case is consistent and fairly solvable
  content/
    blackthorn/case.ts   Chapter One content and canonical solution (data only)
  scenes/      Phaser scenes (Boot, Title, Room) and placeholder art
  ui/          Reusable interface pieces: buttons, focus handling, dialogue panel, journal, deduction board
tests/         Vitest tests for core systems and content
```

Content never contains logic, and systems never import a specific case, so new chapters are new data files.

## Writing content

Every case file includes a `canon` section with the true timeline. Statements are marked `truthful` or not, and the
validator checks that the deduction's answer is a statement canon marks as untrue, that every clue it relies on
can be found, and that the deduction stays locked until the player has all of them. `npm test` runs this check.
