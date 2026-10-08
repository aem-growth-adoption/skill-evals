import { loadWithRecipe, readOutputs, recipeProblems } from './live-lib.mjs';

const fail = (reason) => ({ pass: false, score: 0, reason });
const ok = (reason) => ({ pass: true, score: 1, reason });

/** A skill that produces broken output is a benchmark failure, never a harness error. */
const graded = (check) => (output, context) => {
  try {
    return check(output, context);
  } catch (error) {
    return fail(`check crashed on the agent's output: ${error.message.split('\n')[0]}`);
  }
};

/** The agent produced a probe report and a recipe consistent with it. */
export const reportAndRecipeConsistent = graded(function reportAndRecipeConsistent(_output, { vars, providerResponse }) {
  const { report, recipe } = readOutputs(providerResponse);
  if (!report) return fail('probe-report.json missing or invalid');
  if (report.firstSuccess === null) {
    return recipe ? fail('recipe written although every config failed') : ok('no recipe, all configs failed');
  }
  if (!recipe) return fail(`browser-recipe.json missing (firstSuccess=${report.firstSuccess})`);
  if (recipe.url !== vars.url) return fail(`recipe url ${recipe.url} != ${vars.url}`);
  const problems = recipeProblems(recipe, report.firstSuccess);
  return problems.length
    ? fail(`recipe does not match ${report.firstSuccess}: ${problems.join(', ')}`)
    : ok(`recipe matches ${report.firstSuccess}`);
});

/** End-to-end: the recipe really loads the page in headless playwright-cli. */
export const recipeLoadsPage = graded(function recipeLoadsPage(_output, { vars, providerResponse }) {
  const { recipe } = readOutputs(providerResponse);
  if (!recipe) return fail('no recipe to load with');
  const { result, health } = loadWithRecipe(recipe, vars.url);
  return result === 'success'
    ? ok(`loaded: "${health.title}" (${health.status})`)
    : fail(`still blocked: "${health.title}" status=${health.status}`);
});

/** Drift (informational): the site needs the same config as when expectations were recorded. */
export const matchesExpectedTier = graded(function matchesExpectedTier(_output, { vars, providerResponse }) {
  const { report } = readOutputs(providerResponse);
  const got = report?.firstSuccess ?? null;
  return got === vars.expected_first_success
    ? ok(`firstSuccess=${got}`)
    : fail(`site drift: expected ${vars.expected_first_success}, got ${got}`);
});
