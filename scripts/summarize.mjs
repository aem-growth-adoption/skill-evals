#!/usr/bin/env node
// Usage: summarize.mjs <promptfoo-output.json> <skill> <ref>
// Reduces a promptfoo output file to one row per run and writes it to results/<skill>/.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [file, skill, ref] = process.argv.slice(2);
if (!file || !skill || !ref) {
  console.error('usage: summarize.mjs <promptfoo-output.json> <skill> <ref>');
  process.exit(1);
}

const isScored = (c) => (c.assertion?.weight ?? 1) !== 0;
const runs = JSON.parse(readFileSync(file, 'utf-8')).results.results.map((r) => ({
  model: r.provider.label,
  site: r.testCase.vars.slug,
  pass: r.success,
  latency_s: Math.round((r.latencyMs ?? 0) / 100) / 10,
  cost_usd: Math.round((r.response?.cost ?? 0) * 1e4) / 1e4,
  timed_out: r.response?.metadata?.timedOut ?? false,
  why: r.error ?? (r.gradingResult?.componentResults ?? []).filter((c) => !c.pass && isScored(c)).map((c) => c.reason),
}));

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const date = new Date().toISOString().slice(0, 10);
const dir = join(root, 'results', skill);
mkdirSync(dir, { recursive: true });
const name = `${date}-${ref.replace(/[^\w.-]+/g, '_')}-${[...new Set(runs.map((r) => r.model))].join('+')}.json`;
writeFileSync(join(dir, name), `${JSON.stringify({ skill, ref, date, runs }, null, 2)}\n`);
console.log(`${runs.length} runs -> results/${skill}/${name}`);
