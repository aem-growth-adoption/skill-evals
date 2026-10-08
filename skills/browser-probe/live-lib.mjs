import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
// The copy of the skill under test that scripts/setup.sh put in the workspace.
const SKILL_DIR = resolve(here, '../../workspace/browser-probe/.claude/skills/browser-probe');
const { checkHealth, parseEvalOutput } = await import(join(SKILL_DIR, 'scripts/browser-probe.js'));

const HEALTH_JS = `JSON.stringify({
  title: document.title || '',
  url: location.href,
  bodyLength: document.body ? document.body.innerText.length : 0,
  status: (performance.getEntriesByType('navigation')[0] || {}).responseStatus || 0,
  hasMainContent: !!document.querySelector('main, [role="main"], article, #content')
})`;

const pw = (session, ...args) =>
  execFileSync('playwright-cli', [`-s=${session}`, ...args], { encoding: 'utf-8', timeout: 60_000 }).trim();

/** Missing or malformed files read as null so assertions report them as failures, not crashes. */
function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

/** Reads the agent's files from `<workspace>/out` of the run that produced `providerResponse`. */
export function readOutputs(providerResponse) {
  const dir = join(providerResponse.metadata.workingDir, 'out');
  return {
    report: readJson(join(dir, 'probe-report.json')),
    recipe: readJson(join(dir, 'browser-recipe.json')),
  };
}

/** Expected recipe shape for each probe step, from the SKILL.md mapping table. */
export function recipeProblems(recipe, firstSuccess) {
  const opts = recipe.cliConfig?.browser?.launchOptions ?? {};
  const wantStealth = firstSuccess !== 'default';
  const wantUa = ['stealth-ua', 'chrome', 'persistent'].includes(firstSuccess);
  const wantChrome = ['chrome', 'persistent'].includes(firstSuccess);
  const checks = {
    'stealth script': Boolean(recipe.stealthInitScript) === wantStealth,
    'user-agent arg': (opts.args ?? []).some((a) => a.startsWith('--user-agent=')) === wantUa,
    'chrome channel': (opts.channel === 'chrome') === wantChrome,
    'persistent flag': Boolean(recipe.persistent) === (firstSuccess === 'persistent'),
  };
  return Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
}

/** Loads `url` with the recipe the way the SKILL.md consumer section describes. */
export function loadWithRecipe(recipe, url) {
  const id = randomUUID().slice(0, 8);
  const session = `verify-${id}`;
  const dir = join(tmpdir(), `bp-${session}`);
  mkdirSync(dir, { recursive: true });
  const config = structuredClone(recipe.cliConfig);
  if (recipe.stealthInitScript) {
    const script = join(dir, 'stealth.js');
    writeFileSync(script, recipe.stealthInitScript);
    config.browser.initScript = [script];
  }
  const configPath = join(dir, 'config.json');
  writeFileSync(configPath, JSON.stringify(config));
  const args = ['open', url, `--config=${configPath}`];
  if (recipe.persistent) args.push('--persistent');
  try {
    pw(session, ...args);
    for (let i = 0; i < 10 && parseEvalOutput(pw(session, 'eval', 'document.readyState')) !== 'complete'; i++);
    const health = JSON.parse(parseEvalOutput(pw(session, 'eval', HEALTH_JS)));
    return { health, result: checkHealth(health) };
  } finally {
    for (const cmd of ['close', 'delete-data']) {
      try { pw(session, cmd); } catch { /* session already gone */ }
    }
  }
}
