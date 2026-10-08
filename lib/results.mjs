import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const models = parse(readFileSync(join(root, 'models.yaml'), 'utf-8')).sort((a, b) => a.rank - b.rank);
export const read = (...p) => readFileSync(join(root, ...p), 'utf-8');
export const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : '-');

export const loadSkill = (skill) => {
  const { floor } = parse(read('skills', skill, 'skill.yaml'));
  const files = readdirSync(join(root, 'results', skill)).filter((f) => f.endsWith('.json'));
  const summaries = files.map((f) => JSON.parse(read('results', skill, f)));
  return { skill, floor, rows: summaries.flatMap((s) => s.runs), refs: [...new Set(summaries.map((s) => s.ref))] };
};

export const isGood = (r, floor) => r.pass && r.latency_s <= floor.max_latency_s;
export const stats = (runs, floor) => {
  const sorted = runs.map((r) => r.latency_s).sort((a, b) => a - b);
  const good = runs.filter((r) => isGood(r, floor)).length;
  return {
    n: runs.length,
    good,
    meets: runs.length > 0 && good / runs.length >= floor.min_pass_rate,
    avg: runs.reduce((s, r) => s + r.latency_s, 0) / (runs.length || 1),
    p95: sorted[Math.min(sorted.length - 1, Math.ceil(0.95 * sorted.length) - 1)] ?? 0,
    timeouts: runs.filter((r) => r.timed_out).length,
    cost: runs.reduce((s, r) => s + r.cost_usd, 0) / (runs.length || 1),
  };
};

export const cell = (s) => (s.n ? `${s.meets ? '✓' : '✗'} ${pct(s.good, s.n)} (${s.good}/${s.n})` : '·');
export const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');


/** Skills that have a suite and stored results. */
export const loadSkills = () =>
  readdirSync(join(root, 'skills')).filter((s) => readdirSync(join(root, 'results')).includes(s)).map(loadSkill);
