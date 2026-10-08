#!/usr/bin/env node
// Writes REPORT.html: one self-contained page, one row per skill, one column per model, coloured by
// whether the model meets the skill's floor. REPORT-detail.html (promptfoo) has the per-case view.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSkills, models, root, stats } from '../lib/results.mjs';

const skills = loadSkills();
const known = new Set(models.map((m) => m.label));
const totalRuns = skills.reduce((n, s) => n + s.rows.filter((r) => known.has(r.model)).length, 0);
const baseline = models.findIndex((m) => m.baseline);
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const heat = (s, floor) => {
  if (!s.n) return 'none';
  if (s.meets) return 'ok';
  return s.good / s.n >= floor.min_pass_rate - 0.2 ? 'near' : 'bad';
};

const rows = skills.map((sk) => {
  const per = models.map((m) => stats(sk.rows.filter((r) => r.model === m.label), sk.floor));
  const lowest = models.find((_, i) => per[i].meets)?.label ?? 'none';
  const baselineBad = baseline >= 0 && per[baseline].n > 0 && !per[baseline].meets;
  const cells = per.map((s) => (s.n
    ? `<td class="${heat(s, sk.floor)}"><b>${Math.round((100 * s.good) / s.n)}%</b><small>${s.good}/${s.n} · ${s.avg.toFixed(0)} s</small></td>`
    : '<td class="none">·</td>')).join('');
  return `<tr><th>${esc(sk.skill)}</th>${cells}<td class="floor"><b>${esc(lowest)}</b>${baselineBad ? '<small>baseline below floor: provisional</small>' : ''}</td></tr>`;
}).join('\n');

const head = models.map((m) => `<th>${esc(m.label)}${m.baseline ? '<small>baseline</small>' : ''}</th>`).join('');
const date = new Date().toISOString().slice(0, 10);

writeFileSync(join(root, 'REPORT.html'), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Skill evals: lowest model per skill</title>
<style>
  body { font: 15px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f4f6fb; margin: 0; }
  main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 48px; }
  h1 { font-size: 24px; margin: 0 0 4px; } p { margin: 4px 0 16px; color: #55627a; }
  table { border-collapse: separate; border-spacing: 4px; width: 100%; }
  th, td { padding: 10px 12px; text-align: center; border-radius: 6px; background: #fff; }
  thead th { background: none; font-weight: 600; } th small { display: block; font-weight: 400; color: #55627a; }
  tbody th { text-align: left; background: none; font-weight: 600; }
  td b { display: block; font-size: 17px; } td small { display: block; color: #55627a; font-size: 12px; }
  .ok { background: #dff5e7; } .near { background: #fdf0d2; } .bad { background: #fbdcd8; } .none { color: #99a; }
  .floor { background: #e8eefc; } .legend span { display: inline-block; padding: 2px 10px; border-radius: 4px; margin-right: 8px; font-size: 13px; }
  footer { margin-top: 20px; color: #55627a; font-size: 13px; }
</style></head><body><main>
<h1>Which model does each skill need?</h1>
<p>Share of runs that pass within the skill's time budget, with average run time. The last column is the lowest-tier model that meets the skill's floor.</p>
<p class="legend"><span class="ok">meets the floor</span><span class="near">within 20 points</span><span class="bad">well below</span><span class="none">not run</span></p>
<table><thead><tr><th>Skill</th>${head}<th>Lowest model meeting the floor</th></tr></thead>
<tbody>
${rows}
</tbody></table>
<footer>${skills.length} skills, ${models.length} models, ${totalRuns} runs, generated ${date}. Floor: pass rate and time budget per skill (skills/&lt;skill&gt;/skill.yaml), usually 90% within 120 s.
Models run in tier order; the baseline must meet the floor first. Small samples (9 to 27 runs per cell): gaps of a few points are noise.
Per-case view: REPORT-detail.html. Written to REPORT.md as well.</footer>
</main></body></html>
`);
console.log('REPORT.html written');
