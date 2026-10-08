import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { buildConfig } from '../../lib/config.mjs';

const suiteDir = dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  skill: 'page-langs',
  suiteDir,
  prompt: `Audit the languages of {{url}}: which languages the markup declares, which
languages the body text is actually written in, and where the two disagree.
Save the structured result in ./out/ (relative to your working directory),
then summarize the findings in a few sentences.`,
  tests: parse(readFileSync(join(suiteDir, 'cases.yaml'), 'utf-8')),
  assert: [{ file: 'assert.mjs', fn: 'langsMatchExpected' }],
});
