// ---------------------------------------------------------------------------
// Scenario engine: pure functions for walking a branching scenario and
// building the learning summary. No React here, so it can be tested in Node.
// ---------------------------------------------------------------------------

import { TACTICS, getTactic } from '../data/tactics.js';

export const RATINGS = {
  safer: { label: 'Safer choice', points: 2 },
  caution: { label: 'Partly safe', points: 1 },
  risky: { label: 'Risky choice', points: 0 },
};

/**
 * Build the end-of-scenario learning summary.
 * @param {object} scenario
 * @param {{stepId: string, choiceId: string}[]} path  Decisions in order.
 */
export function buildLearningSummary(scenario, path) {
  const tacticsSeen = new Set();
  const missedSigns = [];
  let saferCount = 0;
  let points = 0;

  const decisions = path.map(({ stepId, choiceId }) => {
    const step = scenario.steps[stepId];
    const choice = step.choices.find((c) => c.id === choiceId);
    step.tactics.forEach((t) => tacticsSeen.add(t));
    choice.tactics.forEach((t) => tacticsSeen.add(t));
    points += RATINGS[choice.rating].points;
    if (choice.rating === 'safer') saferCount += 1;
    else missedSigns.push(...(step.warningSigns || []));
    return { step, choice };
  });

  const lastChoice = decisions.length ? decisions[decisions.length - 1].choice : null;
  const ending = lastChoice && lastChoice.end ? scenario.endings[lastChoice.end] : null;

  return {
    ending,
    decisions,
    saferCount,
    totalDecisions: decisions.length,
    points,
    maxPoints: decisions.length * RATINGS.safer.points,
    tactics: [...tacticsSeen].map((key) => ({ key, ...getTactic(key) })),
    missedSigns: [...new Set(missedSigns)],
    checklist: scenario.checklist,
  };
}

/** Returns a list of problems. An empty list means the scenario is valid. */
export function validateScenario(scenario) {
  const problems = [];
  const { steps, endings, start } = scenario;
  if (!steps[start]) problems.push(`start step "${start}" does not exist`);

  for (const [stepId, step] of Object.entries(steps)) {
    if (!Array.isArray(step.choices) || step.choices.length < 2 || step.choices.length > 3) {
      problems.push(`${stepId}: needs 2–3 choices`);
    }
    for (const t of step.tactics || []) {
      if (!TACTICS[t]) problems.push(`${stepId}: unknown tactic "${t}"`);
    }
    for (const choice of step.choices || []) {
      const where = `${stepId}.${choice.id}`;
      if (!RATINGS[choice.rating]) problems.push(`${where}: invalid rating`);
      if (!choice.tactics || choice.tactics.length === 0) problems.push(`${where}: must name a tactic`);
      for (const t of choice.tactics || []) {
        if (!TACTICS[t]) problems.push(`${where}: unknown tactic "${t}"`);
      }
      if (choice.next && !steps[choice.next]) problems.push(`${where}: next step "${choice.next}" missing`);
      if (choice.end && !endings[choice.end]) problems.push(`${where}: ending "${choice.end}" missing`);
      if (!choice.next && !choice.end) problems.push(`${where}: needs "next" or "end"`);
      if (!choice.consequence || !choice.explanation || !choice.nextAction) {
        problems.push(`${where}: needs consequence, explanation and nextAction`);
      }
    }
  }

  // Every path from start to an ending must have 3 or 4 decisions.
  const walk = (stepId, depth, seen) => {
    if (seen.has(stepId)) {
      problems.push(`loop detected at ${stepId}`);
      return;
    }
    const step = steps[stepId];
    if (!step) return;
    for (const choice of step.choices) {
      if (choice.end) {
        if (depth < 3 || depth > 4) problems.push(`path ending at ${stepId}.${choice.id} has ${depth} decisions`);
      } else if (choice.next) {
        walk(choice.next, depth + 1, new Set([...seen, stepId]));
      }
    }
  };
  if (steps[start]) walk(start, 1, new Set());

  // Every step should be reachable.
  const reachable = new Set();
  const visit = (id) => {
    if (reachable.has(id) || !steps[id]) return;
    reachable.add(id);
    steps[id].choices.forEach((c) => c.next && visit(c.next));
  };
  visit(start);
  for (const id of Object.keys(steps)) {
    if (!reachable.has(id)) problems.push(`step "${id}" is unreachable`);
  }

  return [...new Set(problems)];
}
