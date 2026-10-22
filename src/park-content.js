// A small invitation to do mathematics, carried through a large garden.
export const DISTRICTS = [
  {
    id: 'geometry', name: 'Geometry Garden', label: 'Geometry', discipline: 'Geometry',
    color: '#7F9F86', symbol: '△',
    question: 'What can a drawing tell you before a proof begins?',
    description: 'Follow shapes, surfaces, and spaces. Change a viewpoint and look for what survives.'
  },
  {
    id: 'analysis', name: 'Continuum Meadow', label: 'Analysis & probability', discipline: 'Analysis & probability',
    color: '#BB9C64', symbol: '∫',
    question: 'How do small changes become a pattern?',
    description: 'Explore limits, motion, approximation, and chance through experiments you can do on paper.'
  },
  {
    id: 'algebra', name: 'Symmetry Court', label: 'Algebra & number theory', discipline: 'Algebra & number theory',
    color: '#A085AB', symbol: '⊕',
    question: 'What stays the same when you change the rules?',
    description: 'Meet equations, arithmetic, and symmetry. Try a tiny case and see which familiar rules still work.'
  },
  {
    id: 'logic', name: 'Logic Grove', label: 'Logic & foundations', discipline: 'Logic & foundations',
    color: '#7B9EB0', symbol: '∀',
    question: 'What exactly follows from your assumptions?',
    description: 'Slow down a claim, inspect its quantifiers, and build examples that separate nearby statements.'
  },
  {
    id: 'systems', name: 'Systems Orchard', label: 'Programming & databases', discipline: 'Programming & databases',
    color: '#6FA89A', symbol: '{ }',
    question: 'How do simple rules make a reliable system?',
    description: 'Give ideas a structure: records, instructions, languages, and checks that make them usable.'
  },
  {
    id: 'information', name: 'Signal Gardens', label: 'Information & computation', discipline: 'Information & computation',
    color: '#BD8C73', symbol: '01',
    question: 'How much of a message do you really need?',
    description: 'Investigate codes, signals, inference, and secrecy by making and testing a small message.'
  },
  {
    id: 'complexity', name: 'Possibility Woods', label: 'Computational complexity', discipline: 'Computational complexity',
    color: '#8888AE', symbol: 'P?',
    question: 'What makes a problem easy to state and hard to solve?',
    description: 'Compare finding, checking, and searching. Keep track of how a method grows with its input.'
  },
  {
    id: 'graphs', name: 'Bridge Grove', label: 'Graphs & combinatorics', discipline: 'Graphs & combinatorics',
    color: '#B68A98', symbol: '⋈',
    question: 'Which connections hold a whole world together?',
    description: 'Draw networks, count possibilities, and change one edge to discover what depends on it.'
  },
  {
    id: 'algorithms', name: 'Pathfinder Terrace', label: 'Algorithms & optimization', discipline: 'Algorithms & optimization',
    color: '#93A36B', symbol: '→',
    question: 'What is the next step, and why is it the right one?',
    description: 'Walk through a procedure by hand. Watch its choices, its memory, and the reason it succeeds.'
  }
].map((district, index) => {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / 9;
  return { ...district, x: 145 * Math.cos(angle), z: 145 * Math.sin(angle) };
});

export const MISSIONS = [
  {
    id: 'circle-estimate', district: 'geometry', title: 'Measure a curve with straight lines', minutes: 15,
    prompt: 'How closely can a polygon approximate a circle?',
    steps: [
      'Draw a circle of radius 3 cm and mark six equally spaced points. Join them to make an inscribed regular hexagon.',
      'Split the hexagon into six equilateral triangles. Use triangle area = √3 × side² / 4 to calculate its total area.',
      'Compare with the circle area, 9π cm². Sketch twelve equally spaced points and explain why the new inscribed polygon has more area.'
    ],
    output: 'A drawing, a numerical comparison, and one sentence about improving the approximation.'
  },
  {
    id: 'area-by-slices', district: 'analysis', title: 'Watch an approximation settle', minutes: 15,
    prompt: 'Estimate the area under y = x² between x = 0 and x = 1.',
    steps: [
      'Divide [0, 1] into two equal intervals. For each interval, multiply its width by the function value at its midpoint and add the results.',
      'Repeat with four equal intervals, then eight. Record the three estimates in a small table.',
      'Compare each estimate with the exact area 1/3. Draw the midpoint rectangles and describe which part of the curve each misses.'
    ],
    output: 'Three estimates and a picture that explains their error.'
  },
  {
    id: 'modular-roots', district: 'algebra', title: 'An equation with unexpected roots', minutes: 15,
    prompt: 'Does x² = 1 always have just two solutions?',
    steps: [
      'For the remainders 0 through 4, compute x² modulo 5 and list the solutions of x² ≡ 1 (mod 5).',
      'Do the same for remainders modulo 8, then modulo 9. Keep each multiplication visible.',
      'For the solution x = 3 modulo 8, calculate (x − 1)(x + 1). Notice that the product is zero modulo 8 even though neither factor is zero. Write the arithmetic rule that fails here.'
    ],
    output: 'Three short tables and a concrete example showing that a zero product need not have a zero factor modulo 8.'
  },
  {
    id: 'implication-cards', district: 'logic', title: 'Turn a claim around', minutes: 15,
    prompt: 'Separate an implication, its converse, and its contrapositive.',
    steps: [
      'Write the claim: “If an integer is divisible by 4, then it is even.” Identify its assumption and its conclusion.',
      'Write its converse and its contrapositive. Test each statement on the integers 2, 4, 5, and 8.',
      'Build the four-row truth table for P ⇒ Q, Q ⇒ P, and ¬Q ⇒ ¬P. Compare the columns.'
    ],
    output: 'Three precise statements, a counterexample to the converse, and a truth table.'
  },
  {
    id: 'tiny-database', district: 'systems', title: 'Make a tiny library work', minutes: 15,
    prompt: 'Design a reading log that can answer a useful question.',
    steps: [
      'Create a Books table with id, title, and author. Add three books. Create a Sessions table with book_id, date, and minutes; add five reading sessions for just two of the books.',
      'Join each session to its book using the matching id. Sum reading minutes for each book by hand.',
      'Write precise pseudocode or a SQL query to produce all three totals, including zero for the unread book. SQL hint: use LEFT JOIN, GROUP BY, and COALESCE(SUM(minutes), 0).',
    ],
    output: 'Two tiny tables and a repeatable way to find the minutes spent on each book.'
  },
  {
    id: 'shorter-message', district: 'information', title: 'Build a code you can decode', minutes: 15,
    prompt: 'Can a common letter use less space than a rare one?',
    steps: [
      'Take the message AAAABBCD. Encode A, B, C, D with the fixed two-bit codes 00, 01, 10, 11 and count the bits.',
      'Encode the same message with A = 0, B = 10, C = 110, D = 111. Count the bits and decode your result from left to right.',
      'Explain why no codeword is the beginning of another. Try DDDD and compare the lengths again; account for the codebook separately if you would transmit it.'
    ],
    output: 'Two encoded messages and an example showing when the variable-length code helps.'
  },
  {
    id: 'greedy-counterexample', district: 'complexity', title: 'A tempting choice goes wrong', minutes: 15,
    prompt: 'Test a greedy rule for the 0–1 knapsack problem: each item is indivisible.',
    steps: [
      'Set capacity to 50. Use three items with (weight, value) equal to (10, 60), (20, 100), and (30, 120). Calculate each value-to-weight ratio.',
      'Take items in decreasing ratio order whenever they fit. Record the final weight and value.',
      'List all eight subsets, discard those over capacity, and find the best remaining value. State exactly which greedy rule your example disproves.'
    ],
    output: 'A complete small counterexample, including the greedy and optimal choices.'
  },
  {
    id: 'bridge-experiment', district: 'graphs', title: 'One edge changes everything', minutes: 15,
    prompt: 'Find the edges that hold a network together.',
    steps: [
      'Draw two disjoint four-cycles. Join one vertex of the first to one vertex of the second with a single edge.',
      'For every edge, imagine deleting it while keeping all vertices. Mark it as a bridge precisely when the graph becomes disconnected.',
      'Add a second edge between a different pair of vertices across the two cycles. Repeat the deletion test and explain what happened to the original bridge.'
    ],
    output: 'Two annotated graphs and an explanation using an alternative path.'
  },
  {
    id: 'shortest-path-walk', district: 'algorithms', title: 'Find a route one choice at a time', minutes: 15,
    prompt: 'Run Dijkstra’s algorithm by hand on a small undirected weighted graph.',
    steps: [
      'Draw vertices A through F and edges AB:4, AC:1, CB:2, BD:1, CD:5, DE:3, CF:7, and FE:1. Start from A.',
      'Set A’s tentative distance to zero and all others to infinity. Repeatedly settle the unsettled vertex with the smallest distance. For each unsettled neighbor, keep the smaller of its old distance and the settled distance plus the connecting edge’s weight.',
      'Record which predecessor gave each improvement and reconstruct one shortest path from A to E. Consider how a later negative edge could undermine a distance you already settled.'
    ],
    output: 'A distance table, a shortest path, and one sentence explaining the crucial assumption.'
  },
  {
    id: 'draw-a-connection', district: 'general', title: 'Draw an idea before naming it', minutes: 15,
    prompt: 'Make a small abstract drawing about connection.',
    steps: [
      'Choose five points on a page. Connect some pairs with red curves and some pairs with blue curves. Keep a small record of which pairs are connected.',
      'Redraw the same connections with the points in different positions. Let the new drawing have a different mood.',
      'Give each drawing a title. Write one sentence describing what changed visually and one describing what stayed the same mathematically.'
    ],
    output: 'Two drawings of the same colored graph with different visual personalities.'
  },
  {
    id: 'three-shot-question', district: 'general', title: 'A question in three quiet shots', minutes: 15,
    prompt: 'Plan a tiny film about noticing something you usually pass by.',
    steps: [
      'Choose an ordinary object or place within reach: a window, an empty chair, a cup, or a doorway. Write one question it suggests.',
      'Sketch three shots: the setting, one revealing detail, and the setting again. Give each a duration and one sound; no dialogue is needed.',
      'Record the shots with your phone or keep the storyboard. Describe how the final shot changes what the first shot meant.'
    ],
    output: 'A three-frame storyboard or a very short film with one clear question.'
  },
  {
    id: 'modular-rhythm', district: 'general', title: 'Hear two clocks meet', minutes: 15,
    prompt: 'Make a rhythm from two simple repeating rules.',
    steps: [
      'Write beats 1 through 12. Put a red mark on beats divisible by 3 and a blue mark on beats divisible by 4.',
      'Tap a different surface for each color, or draw a score. Move slowly through the twelve beats, combining the taps when both marks appear.',
      'Repeat with periods 3 and 5 across fifteen beats. Predict the next shared beat for each pattern and connect your prediction to the least common multiple.'
    ],
    output: 'Two short rhythm scores and a rule for when their accents meet.'
  }
];

export const LANDMARKS = {
  fountain: {
    name: 'Question Fountain', title: 'Begin with a question',
    description: 'A place to pause, choose a small experiment, and let curiosity decide your next walk.',
    missionIds: ['bridge-experiment', 'greedy-counterexample', 'implication-cards']
  },
  studio: {
    name: 'Open Studio', title: 'Leave with something you made',
    description: 'Turn a connection into a drawing, a rhythm, or a few quiet frames. A small finished piece is enough.',
    missionIds: ['draw-a-connection', 'three-shot-question', 'modular-rhythm']
  },
  amphitheater: {
    name: 'Conversation Amphitheater', title: 'Make an idea clear enough to share',
    description: 'Explain a tiny example, invite a counterexample, and discover where your assumptions enter.',
    missionIds: ['implication-cards', 'shorter-message', 'bridge-experiment']
  },
  observatory: {
    name: 'Possibility Observatory', title: 'Look beyond the first answer',
    description: 'Inspect the landscape of possibilities. Test a rule, trace a method, and write the next question.',
    missionIds: ['greedy-counterexample', 'modular-roots', 'shortest-path-walk']
  }
};
