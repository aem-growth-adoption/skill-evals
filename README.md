# skill-evals

Live, real-world evals for agent skills, run with promptfoo through Pi, plus a report of the
lowest model that is good enough per skill. Fixture-based scenarios stay in the skills repo.

```
scripts/run.sh <skill> [git-ref] [provider-regex]   # set up workspace, run 3x per case, store summary
node scripts/report.mjs                             # results/ -> REPORT.md
```

- `models.yaml`: model matrix, ranked low to high. Credentials come from your local Pi setup.
- `skills/<skill>/`: `promptfooconfig.live.yaml`, `sites.yaml` (real cases + expected result),
  assertions, and `skill.yaml` (the floor: pass rate and latency a model must reach).
- `scripts/setup.sh`: builds `workspace/<skill>` from a git ref of the skills repo
  (`SKILLS_REPO`, `SKILLS_PATH`), so the same suite compares a branch with `main`.
- `results/`: one summary per run. Raw promptfoo output stays in `output/` (gitignored); do not use
  `promptfoo share`, results contain real site names.

Add a model: one entry in `models.yaml` and one provider entry per skill config.
Add a skill: `skills/<name>/` with a config, cases, assertions and `skill.yaml`.

## Sources

No external sources. Provider behaviour follows https://www.promptfoo.dev/docs/guides/test-agent-skills/
and Pi's SDK docs (https://pi.dev/docs/latest/sdk).
