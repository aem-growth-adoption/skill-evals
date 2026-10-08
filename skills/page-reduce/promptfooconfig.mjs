import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { buildConfig } from '../../lib/config.mjs';

const suiteDir = dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  skill: 'page-reduce',
  suiteDir,
  prompt: `{{task}}
Page: {{url}}
Use ./out/ (relative to your working directory) for every file, then summarize in a few sentences.`,
  tests: parse(readFileSync(join(suiteDir, 'cases.yaml'), 'utf-8')),
  assert: [{ file: 'assert.mjs', fn: 'reduceMatches' }],
});
