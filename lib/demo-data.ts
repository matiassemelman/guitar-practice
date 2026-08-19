export const DEMO_DATA = {
  profile: {
    level: 'Intermediate',
    mainGoal: 'Play complete arrangements with clean transitions and steady time.',
  },
  stats: {
    currentStreak: 6,
    weeklyMinutes: 145,
    weeklyAverageQuality: 4.2,
    weeklySessionCount: 5,
    totalSessions: 28,
  },
  habits: [
    { label: 'Warm-up', value: '10 min', done: true },
    { label: 'Chord transitions', value: '72 BPM', done: true },
    { label: 'Lesson review', value: '20 min', done: false },
  ],
  sessions: [
    {
      id: 'demo-1',
      date: 'Aug 18',
      objective: 'Clean Am–F–C–G transitions without breaking tempo',
      focus: 'Coordination',
      duration: 30,
      target: 72,
      achieved: 68,
      quality: 4,
      reflection: 'The transition into F improved when I isolated the index-finger landing.',
    },
    {
      id: 'demo-2',
      date: 'Aug 17',
      objective: 'Keep sixteenth-note accents even through the chorus pattern',
      focus: 'Rhythm',
      duration: 25,
      target: 84,
      achieved: 80,
      quality: 4,
      reflection: 'Shorter loops made the weak beat obvious and easier to correct.',
    },
    {
      id: 'demo-3',
      date: 'Aug 15',
      objective: 'Play the first verse with clean string changes',
      focus: 'Repertoire',
      duration: 35,
      target: 76,
      achieved: 76,
      quality: 5,
      reflection: 'The full verse held together after practicing the two hardest bars separately.',
    },
  ],
  analysis: {
    headline: 'Consistency is improving faster than raw tempo',
    summary:
      'Across the sample sessions, quality stays stable while achieved tempo moves closer to the target. The strongest pattern is the use of short, isolated loops before returning to the complete passage.',
    evidence: [
      'Five sessions and 145 focused minutes this week.',
      'Average quality remains above four while tempo difficulty increases.',
      'Reflections repeatedly connect progress with isolating transitions and weak beats.',
    ],
    experiment:
      'For the next three sessions, use one five-minute baseline take, ten minutes of isolated-loop work, and one final take at the same BPM. Compare clean transitions rather than increasing tempo immediately.',
  },
} as const;
