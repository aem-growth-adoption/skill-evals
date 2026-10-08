import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const ok = (reason) => ({ pass: true, score: 1, reason });
export const fail = (reason) => ({ pass: false, score: 0, reason });

/** A skill that produces broken output is a benchmark failure, never a harness error. */
export const graded = (check) => (output, context) => {
  try {
    return check(output, context);
  } catch (error) {
    return fail(`check crashed on the agent's output: ${String(error.message).split('\n')[0]}`);
  }
};

/** Directory the agent was told to write to (`./out`) in the run that produced `providerResponse`. */
export const outDir = (providerResponse) => join(providerResponse.metadata.workingDir, 'out');

export const readText = (providerResponse, name) => {
  const path = join(outDir(providerResponse), name);
  return existsSync(path) ? readFileSync(path, 'utf-8') : null;
};

/** Missing or malformed JSON reads as null so assertions report a failure instead of crashing. */
export function readJson(providerResponse, name) {
  const text = readText(providerResponse, name);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Runs `playwright-cli` inside the browser session the agent used in this run. */
export function sessionEval(providerResponse, expression) {
  const session = providerResponse.metadata.runId;
  const raw = execFileSync('playwright-cli', [`-s=${session}`, 'eval', expression], {
    encoding: 'utf-8',
    timeout: 30_000,
  });
  const start = raw.indexOf('### Result');
  const end = raw.indexOf('### Ran Playwright code');
  const value = raw.slice(start + '### Result'.length, end === -1 ? undefined : end).trim();
  return JSON.parse(value);
}
