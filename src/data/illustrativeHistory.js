// Illustrative rows shown on the Overview page ONLY when the user has no
// history yet. They are clearly labelled in the UI as sample data.

export const ILLUSTRATIVE_HISTORY = [
  {
    id: 'demo-1',
    date: '2026-10-18T10:12:00.000Z',
    category: 'Job or internship fee',
    bandKey: 'high',
    band: 'Strong match for a known scam pattern',
    matchedChecks: 5,
  },
  {
    id: 'demo-2',
    date: '2026-10-17T16:40:00.000Z',
    category: 'Bank / KYC suspension',
    bandKey: 'high',
    band: 'Strong match for a known scam pattern',
    matchedChecks: 6,
  },
  {
    id: 'demo-3',
    date: '2026-10-16T08:05:00.000Z',
    category: 'Delivery / customs fee',
    bandKey: 'medium',
    band: 'Several warning signs',
    matchedChecks: 2,
  },
  {
    id: 'demo-4',
    date: '2026-10-15T19:22:00.000Z',
    category: 'No specific pattern',
    bandKey: 'low',
    band: 'Few warning signs found',
    matchedChecks: 0,
  },
];
