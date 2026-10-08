import { fail, graded, ok, readJson, readText } from '../../lib/outputs.mjs';

const problems = (checks) => Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);

const CHECKS = {
  'layout-default': (tree, map) => ({
    'root line': /^r @0,0 \d+x\d+/m.test(tree),
    'three-column grid': /\[3x1\]/.test(tree),
    'gradient background': /\[bg:gradient\]/.test(tree),
    'image background': /\[bg:image\]/.test(tree),
    'fixed banner promoted with dialog role': /\[dialog\]/.test(tree),
    'banner selector in node map': Object.values(map).some((n) => n.selector === '#cookie-banner'),
    'cards selector in node map': Object.values(map).some((n) => /section\.cards/.test(n.selector)),
  }),
  'layout-narrow': (tree, map) => ({
    'root line': /^r @0,0 \d+x\d+/m.test(tree),
    'individual cards captured': /^\s+rc\d+c\d+ .*"?(First|Second|Third) card/m.test(tree) || Object.values(map).some((n) => /\.card/.test(n.selector)),
    'three-column grid': /\[3x1\]/.test(tree),
  }),
  'tree-valid': (tree, map) => ({
    'root line': /^r @0,0 \d+x\d+/m.test(tree),
    'several nodes': tree.split('\n').length >= 5,
    'node map has body root': map.r?.selector === 'body',
    'node map covers tree ids': Object.keys(map).length >= 3,
  }),
};

export const treeMatches = graded((_output, { vars, providerResponse }) => {
  const tree = readText(providerResponse, 'tree.txt');
  const map = readJson(providerResponse, 'nodemap.json');
  if (!tree) return fail('tree.txt missing');
  if (!map) return fail('nodemap.json missing or invalid');
  const failed = problems(CHECKS[vars.check](tree, map));
  return failed.length ? fail(`failed checks: ${failed.join(', ')}`) : ok(`${vars.check} checks passed`);
});
