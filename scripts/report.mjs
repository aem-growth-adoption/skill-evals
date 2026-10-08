#!/usr/bin/env node
// Aggregates results/<skill>/*.json into REPORT.md:
//   1. the gist: lowest model meeting each skill's floor,
//   2. a skill x model matrix (share of runs that passed within the skill's floor),
//   3. per skill: model stats, a case x model matrix and the most common failure reasons.
// scripts/promptfoo-report.mjs renders the same data as promptfoo HTML reports.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { cell, isGood, loadSkills, models, pct, root, stats, table } from '../lib/results.mjs';

/** Failure reasons with numbers and quoted values stripped, so similar failures group together. */
const reasonKey = (r) => {
  if (r.timed_out) return 'timed out';
  const first = Array.isArray(r.why) ? r.why[0] : r.why;
  return String(first ?? 'unknown').replace(/["'`].*?["'`]/g, '…').replace(/\d+(\.\d+)?/g, 'N').slice(0, 90);
};

function summaryRow(sk) {
  const per = models.map((m) => stats(sk.rows.filter((r) => r.model === m.label), sk.floor));
  const lowest = models.find((_, i) => per[i].meets)?.label ?? 'none';
  const baseline = models.findIndex((m) => m.baseline);
  const flag = baseline >= 0 && per[baseline].n && !per[baseline].meets ? ' ⚠ baseline below floor' : '';
  return [`[${sk.skill}](#${sk.skill})`, ...per.map(cell), `**${lowest}**${flag}`];
}

function skillSection(sk) {
  const { skill, floor, rows, refs } = sk;
  const lines = [`## ${skill}`, '', `Floor: ≥ ${floor.min_pass_rate * 100}% of runs pass within ${floor.max_latency_s} s. Skill ref: ${refs.join(', ')}.`, ''];

  const perModel = models.map((m) => [m, stats(rows.filter((r) => r.model === m.label), floor)]).filter(([, s]) => s.n);
  lines.push(table(['Model', 'Runs', 'Passed', 'Within floor', 'Avg s', 'p95 s', 'Timeouts', '$/run'],
    perModel.map(([m, s]) => [m.label + (m.baseline ? ' (baseline)' : ''), s.n, pct(rows.filter((r) => r.model === m.label && r.pass).length, s.n), cell(s), s.avg.toFixed(0), s.p95.toFixed(0), s.timeouts, s.cost.toFixed(3)])), '');

  const cases = [...new Set(rows.map((r) => r.case))];
  lines.push('**By case** (share of runs within the floor)', '');
  lines.push(table(['Case', ...perModel.map(([m]) => m.label)],
    cases.map((c) => [c, ...perModel.map(([m]) => { const s = stats(rows.filter((r) => r.case === c && r.model === m.label), floor); return s.n ? `${pct(s.good, s.n)} (${s.good}/${s.n})` : '·'; })])), '');

  const failures = new Map();
  for (const r of rows.filter((x) => !isGood(x, floor))) {
    const key = `${r.model}: ${reasonKey(r)}`;
    failures.set(key, (failures.get(key) ?? 0) + 1);
  }
  const top = [...failures.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (top.length) lines.push('**Most common failures**', '', ...top.map(([k, n]) => `- ${n}× ${k}`), '');
  return lines.join('\n');
}

const skills = loadSkills();
const known = new Set(models.map((m) => m.label));
const totalRuns = skills.reduce((n, s) => n + s.rows.filter((r) => known.has(r.model)).length, 0);
const lowestFor = (sk) => {
  const per = models.map((m) => stats(sk.rows.filter((r) => r.model === m.label), sk.floor));
  const baseline = models.findIndex((m) => m.baseline);
  return { lowest: models.find((_, i) => per[i].meets)?.label ?? 'none', baselineOk: baseline < 0 || per[baseline].meets };
};
const gist = skills
  .map((sk) => ({ skill: sk.skill, ...lowestFor(sk) }))
  .map(({ skill, lowest, baselineOk }) => `- **${skill}**: ${lowest}${baselineOk ? '' : ' (baseline below its floor, treat as provisional)'}`)
  .join('\n');
const summary = table(['Skill', ...models.map((m) => `${m.label}${m.baseline ? ' (baseline)' : ''}`), 'Lowest model meeting the floor'], skills.map(summaryRow));

writeFileSync(join(root, 'REPORT.md'), `# Skill eval report

${skills.length} skills, ${models.length} models, ${totalRuns} runs. Models are ordered from lowest to highest tier.
Each cell is the share of runs that passed within the skill's time budget; ✓ means it meets the skill's floor
(see each section), ✗ that it does not, · that the model was not run. Numbers rest on small samples (9 to 27 runs
per cell): treat gaps of a few points as noise. Live sites drift, so rerun before relying on one result.

## The gist

${gist}

## Skill x model matrix

${summary}

${skills.map(skillSection).join('\n')}
## How to read this

- A run passes when every scored assertion holds: the skill was loaded, the files or answer match the ground
  truth, and (for browser tasks) the page is really in the expected state. Slower than the budget counts as a failure.
- The baseline model must meet a skill's floor before other models are run (\`scripts/run.sh\`). A ⚠ marks a baseline
  that does not, which means the skill or its eval needs work before the other rows mean anything.
- "Lowest model meeting the floor" uses the model order in \`models.yaml\`, which is a judgment call, not a benchmark.
- Raw promptfoo results stay in \`output/\`; \`npx promptfoo view\` browses the evals run on this machine.
`);
console.log(`REPORT.md written: ${skills.map((s) => s.skill).join(', ')}`);
