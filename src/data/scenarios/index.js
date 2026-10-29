// ---------------------------------------------------------------------------
// Scenario registry. To add a scenario:
//   1. Copy one of the scenario files in this folder and edit its content.
//   2. Import it below and add it to the SCENARIOS array.
//   3. Run `npm test` — it checks every path has 3–4 decisions and every
//      choice names at least one tactic.
// ---------------------------------------------------------------------------

import fakeInternship from './fakeInternship.js';
import bankKyc from './bankKyc.js';
import deliveryFee from './deliveryFee.js';
import familyEmergency from './familyEmergency.js';

export const SCENARIOS = [fakeInternship, bankKyc, deliveryFee, familyEmergency];

export function getScenario(id) {
  return SCENARIOS.find((scenario) => scenario.id === id) || null;
}
