import type { CaseData, Condition } from '../../core/types';

/**
 * Chapter 1 of "The Curious Case of Blackthorn Manor": the drawing room.
 *
 * CONTENT ONLY. Game logic lives in src/core. Ids are prefixed by type:
 * ev_ evidence, s_ statement, hs_ hotspot, d_ deduction, la_/pb_/pq_ dialogue nodes.
 */

/** Everything the player needs before the deduction is fair to attempt. */
const readyToDeduce: Condition = {
  type: 'all',
  of: [
    { type: 'hasEvidence', id: 'ev_violet_print' },
    { type: 'hasEvidence', id: 'ev_black_ink' },
    { type: 'hasStatement', id: 's_quill_never' },
    { type: 'hasStatement', id: 's_quill_violet' },
  ],
};

export const blackthornCase: CaseData = {
  id: 'blackthorn-ch1',
  title: 'The Curious Case of Blackthorn Manor',
  chapter: 'Chapter One: The Blackthorn Star',

  intro: [
    'Blackthorn Manor, on a rainy Wednesday morning.',
    'A telegram arrived at the Young Detectives Society before breakfast: "Come at once. Something precious is missing. Lady A. Blackthorn."',
    'You step into the drawing room. Look around, talk to everyone, and your journal will note down anything important.',
  ],

  canon: {
    summary:
      'The Blackthorn Star was taken from the locked cabinet between 9:05 pm and 10:30 pm by someone who knew the key was hidden behind the portrait, ' +
      'unlocked the cabinet, took the Star, locked it again and put the key back. They used the door, not the window. ' +
      'At 10:30 pm Professor Quill crept in for a closer look, bumped the mantel clock in the dark (stopping it), pressed his inky fingers to the cabinet glass, ' +
      'saw the cushion was already empty, and fled. He lied about it because he was afraid of being blamed. Who took the Star is revealed in a later chapter.',
    timeline: [
      { time: '9:00 pm', event: 'Lady Blackthorn says goodnight to the Star, checks the cabinet is locked, and goes upstairs.' },
      { time: '9:00 pm', event: 'Pembroke opens the window to clear fireplace smoke, losing a brass button, then polishes silver in the pantry until 11:00 pm.' },
      { time: '9:00 pm', event: 'Professor Quill goes to his room.' },
      { time: '9:05–10:30 pm', event: 'The Star is taken using the hidden key, by someone using the door. (Revealed in a later chapter.)' },
      { time: '10:30 pm', event: 'Quill creeps in. He bumps the clock, which stops. Pembroke hears the door creak. Quill presses his fingers to the glass and sees the cushion is empty.' },
      { time: 'Next morning', event: 'Lady Blackthorn finds the cushion empty and sends for the Young Detectives Society.' },
    ],
  },

  characters: [
    {
      id: 'lady_blackthorn',
      name: 'Lady Agatha Blackthorn',
      role: 'Owner of Blackthorn Manor',
      summary: 'Asked the Society for help. The Star belonged to her grandmother.',
      color: 0x7b4fa0,
    },
    {
      id: 'pembroke',
      name: 'Mr. Pembroke',
      role: 'The Butler',
      summary: 'Has worked at the manor for thirty years. Very fond of polishing.',
      color: 0x2f4f6f,
    },
    {
      id: 'quill',
      name: 'Professor Thaddeus Quill',
      role: 'Visiting Collector',
      summary: 'Studies curiosities. Wanted to buy the Star, but Lady Blackthorn said no.',
      color: 0x8a6d3b,
    },
  ],

  evidence: [
    {
      id: 'ev_empty_case',
      kind: 'observation',
      name: 'The Locked Cabinet',
      description: 'The cabinet is still locked and nothing is broken. But the velvet cushion inside is empty!',
    },
    {
      id: 'ev_violet_print',
      kind: 'observation',
      name: 'Violet Fingerprints',
      description: 'Fingerprints on the cabinet glass, in violet ink. Someone with inky fingers pressed against it.',
    },
    {
      id: 'ev_black_ink',
      kind: 'observation',
      name: 'Black Ink Only',
      description: 'The writing desk has just one inkwell, filled with plain black ink.',
    },
    {
      id: 'ev_stopped_clock',
      kind: 'observation',
      name: 'The Stopped Clock',
      description: 'The mantel clock stopped at half past ten. It was knocked crooked, as if someone bumped it in the dark.',
    },
    {
      id: 'ev_hidden_key',
      kind: 'observation',
      name: 'The Hidden Key',
      description: 'A tiny brass key hangs on a hook behind the portrait. It fits the cabinet. Whoever opened the cabinet might have known it was there.',
    },
    {
      id: 'ev_open_window',
      kind: 'observation',
      name: 'The Open Window',
      description: 'The window is open and rain has dripped onto the sill. But there are no muddy footprints on the sill or the rug.',
    },
    {
      id: 'ev_brass_button',
      kind: 'item',
      name: 'Brass Button',
      description: 'A shiny brass button with a tiny "B" stamped on it, found on the floor near the window.',
    },
  ],

  statements: [
    { id: 's_lady_nine', speaker: 'lady_blackthorn', text: 'I said goodnight to the Star at nine o\'clock. The cabinet was locked.', truthful: true },
    { id: 's_pembroke_pantry', speaker: 'pembroke', text: 'I was polishing silver in the pantry from nine until eleven.', truthful: true },
    { id: 's_pembroke_creak', speaker: 'pembroke', text: 'At half past ten, I heard the drawing room door creak.', truthful: true },
    { id: 's_pembroke_window', speaker: 'pembroke', text: 'I opened the window at nine to let out the fireplace smoke, and forgot to close it.', truthful: true },
    { id: 's_pembroke_button', speaker: 'pembroke', text: 'That button is from my uniform. I lost it when I opened the window.', truthful: true },
    { id: 's_pembroke_ink', speaker: 'pembroke', text: 'Everyone in the house uses her Ladyship\'s black ink.', truthful: true },
    { id: 's_quill_never', speaker: 'quill', text: 'I went to bed at nine and never set foot in the drawing room all night.', truthful: false },
    { id: 's_quill_violet', speaker: 'quill', text: 'I write everything in violet ink. It\'s all over my fingers!', truthful: true },
    { id: 's_quill_offer', speaker: 'quill', text: 'I offered to buy the Star, but Lady Blackthorn said no.', truthful: true },
  ],

  room: {
    id: 'drawing_room',
    name: 'The Drawing Room',
    wallColor: 0x3f5a4a,
    floorColor: 0x6b4a32,
    hotspots: [
      {
        id: 'hs_desk',
        label: 'Writing desk',
        area: { x: 300, y: 420, width: 230, height: 130 },
        firstLook: ['Lady Blackthorn\'s writing desk. There is a pen, some paper, and one inkwell.', 'The ink is plain black. There is no other ink here.'],
        repeatLook: ['One inkwell. Black ink.'],
        effects: [{ type: 'giveEvidence', id: 'ev_black_ink' }],
      },
      {
        id: 'hs_clock',
        label: 'Stopped clock',
        area: { x: 610, y: 170, width: 100, height: 120 },
        firstLook: [
          'The mantel clock isn\'t ticking. Its hands have stopped at half past ten.',
          'It\'s sitting crooked, as if someone bumped into it in the dark.',
        ],
        repeatLook: ['Still stopped at half past ten.'],
        effects: [{ type: 'giveEvidence', id: 'ev_stopped_clock' }],
      },
      {
        id: 'hs_portrait',
        label: 'Portrait',
        area: { x: 330, y: 105, width: 150, height: 195 },
        firstLook: [
          'A painting of Lady Blackthorn\'s grandmother. She is wearing a big blue brooch: the Blackthorn Star!',
          'The frame is a little crooked. You peek behind it... a tiny brass key is hanging on a hook!',
        ],
        repeatLook: ['The tiny key is still hanging behind the portrait.'],
        effects: [{ type: 'giveEvidence', id: 'ev_hidden_key' }],
      },
      {
        id: 'hs_fireplace',
        label: 'Fireplace',
        area: { x: 540, y: 300, width: 240, height: 180 },
        firstLook: [
          'The fire went out hours ago. The ashes are cold.',
          'There\'s a smoky smell. This chimney must not pull the smoke up very well.',
        ],
        repeatLook: ['Cold ashes and a smoky smell.'],
      },
      {
        id: 'hs_cabinet',
        label: 'Locked cabinet',
        area: { x: 830, y: 200, width: 160, height: 280 },
        firstLook: [
          'This is where the Blackthorn Star was kept. The velvet cushion is empty!',
          'The cabinet is still locked, and nothing is broken. How strange.',
          'Hmm. There are some marks on the glass. Take a closer look.',
        ],
        repeatLook: ['Locked, unbroken, and empty.'],
        effects: [{ type: 'giveEvidence', id: 'ev_empty_case' }],
      },
      {
        id: 'hs_fingerprint',
        label: 'Marks on the glass',
        area: { x: 860, y: 260, width: 100, height: 80 },
        visibleWhen: { type: 'hasEvidence', id: 'ev_empty_case' },
        firstLook: ['Fingerprints! They aren\'t dirt... they\'re ink. Violet ink.', 'Someone with violet ink on their fingers pressed against this glass.'],
        repeatLook: ['Small violet fingerprints on the glass.'],
        effects: [{ type: 'giveEvidence', id: 'ev_violet_print' }],
      },
      {
        id: 'hs_window',
        label: 'Window',
        area: { x: 70, y: 105, width: 190, height: 250 },
        firstLook: [
          'The window is wide open. Raindrops are dripping onto the sill.',
          'If someone climbed in, they would have left muddy footprints. But the sill and the rug are clean.',
        ],
        repeatLook: ['Still open, still dripping. No footprints anywhere.'],
        effects: [{ type: 'giveEvidence', id: 'ev_open_window' }],
      },
      {
        id: 'hs_button',
        label: 'Something shiny',
        area: { x: 200, y: 610, width: 90, height: 72 },
        firstLook: ['Something shiny on the floor! It\'s a brass button with a little "B" on it. You put it in your pocket.'],
        repeatLook: ['Just the spot where you found the button.'],
        effects: [{ type: 'giveEvidence', id: 'ev_brass_button' }],
      },
    ],
    characters: [
      { character: 'quill', area: { x: 60, y: 390, width: 120, height: 260 } },
      { character: 'lady_blackthorn', area: { x: 1025, y: 290, width: 110, height: 340 } },
      { character: 'pembroke', area: { x: 1150, y: 280, width: 110, height: 350 } },
    ],
  },

  dialogues: [
    {
      character: 'lady_blackthorn',
      start: 'la_start',
      nodes: [
        {
          id: 'la_start',
          speaker: 'lady_blackthorn',
          lines: ['Ah, the Young Detectives Society! Thank goodness you\'ve come.', 'The Blackthorn Star has vanished from my cabinet!'],
          effects: [{ type: 'setFlag', id: 'met_lady' }],
          choices: [
            { text: 'What is the Blackthorn Star?', next: 'la_star', once: true },
            { text: 'When did you last see it?', next: 'la_lastseen', once: true },
            { text: 'Who else is in the house?', next: 'la_household', once: true },
            { text: 'I\'ll start investigating.', next: null },
          ],
        },
        {
          id: 'la_hub',
          speaker: 'lady_blackthorn',
          lines: ['What else would you like to know, detective?'],
          choices: [
            { text: 'What is the Blackthorn Star?', next: 'la_star', once: true },
            { text: 'When did you last see it?', next: 'la_lastseen', once: true },
            { text: 'Who else is in the house?', next: 'la_household', once: true },
            { text: 'That\'s all for now.', next: null },
          ],
        },
        {
          id: 'la_star',
          speaker: 'lady_blackthorn',
          lines: ['A blue sapphire brooch, as big as a robin\'s egg.', 'My grandmother wore it when she met the Queen!'],
          choices: [{ text: 'I see.', next: 'la_hub' }],
        },
        {
          id: 'la_lastseen',
          speaker: 'lady_blackthorn',
          lines: ['I said goodnight to it at nine o\'clock last night, and I checked the cabinet was locked.', 'It was sparkling on its cushion. This morning, the cushion was empty!'],
          effects: [{ type: 'recordStatement', id: 's_lady_nine' }],
          choices: [{ text: 'I\'ll write that down.', next: 'la_hub' }],
        },
        {
          id: 'la_household',
          speaker: 'lady_blackthorn',
          lines: [
            'Only Pembroke, our butler, and Professor Quill, who is staying with us to study my collection.',
            'The Professor has been very keen to see the Star up close.',
          ],
          choices: [{ text: 'Thank you.', next: 'la_hub' }],
        },
      ],
    },
    {
      character: 'pembroke',
      start: 'pb_start',
      nodes: [
        {
          id: 'pb_start',
          speaker: 'pembroke',
          lines: ['Good morning. Pembroke, at your service. A terrible business, this.'],
          choices: [
            { text: 'Where were you last night?', next: 'pb_where', once: true },
            { text: 'Did you hear anything?', next: 'pb_heard', once: true },
            { text: 'Why is the window open?', next: 'pb_window', once: true, showWhen: { type: 'hasEvidence', id: 'ev_open_window' } },
            { text: 'Is this your button?', next: 'pb_button', once: true, showWhen: { type: 'hasEvidence', id: 'ev_brass_button' } },
            { text: 'Who uses the ink on the desk?', next: 'pb_ink', once: true, showWhen: { type: 'hasEvidence', id: 'ev_black_ink' } },
            { text: 'Goodbye.', next: null },
          ],
        },
        {
          id: 'pb_hub',
          speaker: 'pembroke',
          lines: ['Is there anything else, detective?'],
          choices: [
            { text: 'Where were you last night?', next: 'pb_where', once: true },
            { text: 'Did you hear anything?', next: 'pb_heard', once: true },
            { text: 'Why is the window open?', next: 'pb_window', once: true, showWhen: { type: 'hasEvidence', id: 'ev_open_window' } },
            { text: 'Is this your button?', next: 'pb_button', once: true, showWhen: { type: 'hasEvidence', id: 'ev_brass_button' } },
            { text: 'Who uses the ink on the desk?', next: 'pb_ink', once: true, showWhen: { type: 'hasEvidence', id: 'ev_black_ink' } },
            { text: 'Goodbye.', next: null },
          ],
        },
        {
          id: 'pb_where',
          speaker: 'pembroke',
          lines: ['In the pantry, polishing the silver, from nine o\'clock until eleven.', 'I do it every Tuesday. The forks get terribly jealous otherwise.'],
          effects: [{ type: 'recordStatement', id: 's_pembroke_pantry' }],
          choices: [{ text: 'Thank you.', next: 'pb_hub' }],
        },
        {
          id: 'pb_heard',
          speaker: 'pembroke',
          lines: ['Now that you mention it... at half past ten, I heard the drawing room door creak.', 'I thought it was the wind. This old house is full of creaks.'],
          effects: [{ type: 'recordStatement', id: 's_pembroke_creak' }],
          choices: [{ text: 'Interesting...', next: 'pb_hub' }],
        },
        {
          id: 'pb_window',
          speaker: 'pembroke',
          lines: ['Ah. I opened it at nine to let out the smoke from the fireplace.', 'I\'m afraid I forgot to close it. How careless of me.'],
          effects: [{ type: 'recordStatement', id: 's_pembroke_window' }],
          choices: [{ text: 'I see.', next: 'pb_hub' }],
        },
        {
          id: 'pb_button',
          speaker: 'pembroke',
          lines: ['My button! "B" for Blackthorn. It must have popped off my uniform when I opened the window.', 'Thank you, detective. I\'ll sew it back on.'],
          effects: [{ type: 'recordStatement', id: 's_pembroke_button' }],
          choices: [{ text: 'You\'re welcome.', next: 'pb_hub' }],
        },
        {
          id: 'pb_ink',
          speaker: 'pembroke',
          lines: ['That is her Ladyship\'s inkwell. Everyone in the house uses it.', 'Black ink, always. Her Ladyship says coloured ink is "showing off".'],
          effects: [{ type: 'recordStatement', id: 's_pembroke_ink' }],
          choices: [{ text: 'Good to know.', next: 'pb_hub' }],
        },
      ],
    },
    {
      character: 'quill',
      start: 'pq_start',
      nodes: [
        {
          id: 'pq_start',
          speaker: 'quill',
          lines: ['Hmm? Oh! A young detective. Splendid, splendid!', 'Professor Thaddeus Quill, collector of curiosities.'],
          choices: [
            { text: 'Where were you last night?', next: 'pq_where', once: true },
            { text: 'What are you writing?', next: 'pq_notes', once: true },
            { text: 'Have you seen the Blackthorn Star?', next: 'pq_star', once: true },
            { text: 'Goodbye.', next: null },
          ],
        },
        {
          id: 'pq_hub',
          speaker: 'quill',
          lines: ['Anything else? I do have a great deal of writing to do.'],
          choices: [
            { text: 'Where were you last night?', next: 'pq_where', once: true },
            { text: 'What are you writing?', next: 'pq_notes', once: true },
            { text: 'Have you seen the Blackthorn Star?', next: 'pq_star', once: true },
            { text: 'Goodbye.', next: null },
          ],
        },
        {
          id: 'pq_where',
          speaker: 'quill',
          lines: ['In my room, fast asleep! I went to bed at nine o\'clock sharp.', 'I never set foot in this drawing room all night. Not once!'],
          effects: [{ type: 'recordStatement', id: 's_quill_never' }],
          choices: [{ text: 'Hmm.', next: 'pq_hub' }],
        },
        {
          id: 'pq_notes',
          speaker: 'quill',
          lines: [
            'My research notes! I write everything in violet ink. It is the only proper colour for a scholar.',
            'Look, I\'ve got it all over my fingers again. Ha!',
          ],
          effects: [{ type: 'recordStatement', id: 's_quill_violet' }],
          choices: [{ text: 'Violet ink. I\'ll remember that.', next: 'pq_hub' }],
        },
        {
          id: 'pq_star',
          speaker: 'quill',
          lines: ['Only yesterday afternoon, through the glass. A magnificent stone!', 'I offered to buy it, you know. Lady Blackthorn said no. Quite firmly.'],
          effects: [{ type: 'recordStatement', id: 's_quill_offer' }],
          choices: [{ text: 'I see.', next: 'pq_hub' }],
        },
      ],
    },
  ],

  deductions: [
    {
      id: 'd_quill_lie',
      type: 'contradiction',
      title: 'Who Isn\'t Telling the Truth?',
      question: 'Someone said something that a clue proves is not true. Who was it, what did they say, and which clue proves it?',
      availableWhen: readyToDeduce,
      solution: { suspect: 'quill', statement: 's_quill_never', evidence: 'ev_violet_print' },
      supportingClues: {
        evidence: ['ev_violet_print', 'ev_black_ink'],
        statements: ['s_quill_never', 's_quill_violet'],
      },
      hints: [
        'Look at your notes about where everyone was last night. Does any clue disagree with one of them?',
        'Think about the fingerprints on the cabinet glass. What colour is it? Who in the house uses that colour?',
        'The desk only has black ink, but Professor Quill writes in violet ink. So who touched the cabinet, and what did he say about the drawing room?',
      ],
      feedback: {
        wrongSuspect: 'Hmm, that person\'s story fits the clues so far. Who said something that a clue seems to disagree with?',
        wrongStatement: 'That\'s the right person! But is that statement really untrue? Look for the one a clue proves wrong.',
        wrongEvidence: 'Right person, right statement! Now, which clue shows they really were in the drawing room?',
      },
      onSolved: {
        lines: [
          { speaker: 'detective', text: 'Professor, you said you never set foot in the drawing room last night.' },
          { speaker: 'detective', text: 'But there are violet ink fingerprints on the cabinet glass, and you\'re the only one here who uses violet ink!' },
          { speaker: 'quill', text: 'Oh dear. Oh dear, oh dear. You\'ve caught me.' },
          { speaker: 'quill', text: 'I crept in at half past ten. I only wanted one closer look at the Star, I promise! I bumped that silly clock in the dark.' },
          { speaker: 'quill', text: 'I pressed my nose to the glass... and the cushion was already empty! I was so frightened someone would blame me that I fibbed.' },
          { speaker: 'quill', text: 'I\'m terribly sorry. I should have told the truth.' },
        ],
        effects: [{ type: 'setFlag', id: 'chapter1_complete' }],
      },
    },
  ],

  objectives: [
    { id: 'o_meet_lady', text: 'Talk to Lady Blackthorn to find out what happened.', completeWhen: { type: 'flag', id: 'met_lady' } },
    { id: 'o_cabinet', text: 'Examine the locked cabinet where the Star was kept.', completeWhen: { type: 'hasEvidence', id: 'ev_empty_case' } },
    { id: 'o_search', text: 'Search the room for clues, and ask everyone where they were last night.', completeWhen: readyToDeduce },
    { id: 'o_deduce', text: 'Open your journal. Can one of your clues prove that someone isn\'t telling the truth?', completeWhen: { type: 'deductionSolved', id: 'd_quill_lie' } },
  ],

  completionFlag: 'chapter1_complete',

  outro: [
    'Well done, detective! You caught Professor Quill\'s fib by matching his words against a clue.',
    'But if the Star was already gone at half past ten, then who took it? And who knew about the key behind the portrait?',
    'The mystery of the Blackthorn Star continues...',
  ],
};
