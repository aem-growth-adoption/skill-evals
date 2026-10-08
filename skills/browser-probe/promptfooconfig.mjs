import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { buildConfig } from '../../lib/config.mjs';

const suiteDir = dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  skill: 'browser-probe',
  suiteDir,
  prompt: `Our headless Chrome automation (playwright-cli) needs to load {{url}}.
Find out whether bot protection is getting in the way and, if so, set up
what our playwright-cli tooling needs to load the page (it reads a
\`browser-recipe.json\`). Put every output file in ./out/ (relative to your
working directory). Then summarize in a few sentences.`,
  tests: parse(readFileSync(join(suiteDir, 'sites.yaml'), 'utf-8')),
  assert: [
    { file: 'assert-live.mjs', fn: 'reportAndRecipeConsistent' },
    { file: 'assert-live.mjs', fn: 'recipeLoadsPage' },
    { file: 'assert-live.mjs', fn: 'matchesExpectedTier', weight: 0 },
  ],
});
