/**
 * No-skill arm only: the run is valid only if Pi had no skills loaded and the agent never went
 * looking for one on disk. A leak is reported as a failure so it cannot inflate the arm's results.
 */
export function noSkillAvailable(_output, { providerResponse }) {
  const m = providerResponse.metadata ?? {};
  if ((m.loadedSkills ?? []).length > 0) return { pass: false, score: 0, reason: `skills were loaded: ${m.loadedSkills.map((s) => s.name).join(', ')}` };
  const touched = (m.toolCalls ?? [])
    .map((c) => String(c.input?.command ?? c.input?.path ?? ''))
    .filter((text) => /SKILL\.md|\.claude\/skills|\.agents\/skills|\/skills\//.test(text));
  return touched.length
    ? { pass: false, score: 0, reason: `agent looked for skills on disk: ${touched[0].slice(0, 120)}` }
    : { pass: true, score: 1, reason: 'no skills loaded or read' };
}
