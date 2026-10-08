# skill-evals

Live, real-world evals for agent skills, run with promptfoo through Pi, plus a report of the
lowest model that is good enough per skill (`REPORT.md`). Fixture-based scenarios (Tessl) stay in
the skills repo.

```
scripts/run.sh <skill> [git-ref] [provider-regex]   # set up workspace, run 3x per case, store summary
node scripts/report.mjs                             # results/ -> REPORT.md
```

- `models.yaml`: model matrix, ranked low to high. Credentials come from your local Pi setup.
- `skills/<skill>/`: `promptfooconfig.mjs` (built with `lib/config.mjs`), cases, assertions and
  `skill.yaml` (the floor: pass rate and latency a model must reach; sibling skills to load).
- `scripts/setup.sh`: builds `workspace/<skill>` from a git ref of the skills repo
  (`SKILLS_REPO`, `SKILLS_PATH`), so the same suite compares a branch with `main`.
- `fixtures/`: controlled pages served on http://localhost:8765 by `scripts/fixtures-server.mjs`
  (started by `run.sh`). Each suite mixes fixtures (known ground truth) with real sites.
- `results/`: one summary per run. Raw promptfoo output stays in `output/` (gitignored); do not use
  `promptfoo share`, results contain real site names.

## How a run is graded

- Every run gets its own copy of the workspace and its own `playwright-cli` session
  (`PLAYWRIGHT_CLI_SESSION=run-<id>`), so runs can execute in parallel.
- Assertions are code, not an LLM judge: they read the files the agent wrote under `./out`, the
  reply, the tools' output, or the agent's own browser session, and compare with ground truth.
  Malformed output is a failure with a reason, never a harness error.
- A run that exceeds the time budget (`timeoutS`, 120 s by default) is aborted and counts as a
  failure. `skill-used` checks that the model really loaded the skill.
- All browsers are headless. `cdp-ext-pilot` normally opens a headed Chromium, so `pre.sh` plants a
  headless shim for it; `cdp-connect` starts its own headless Chrome on port 9222.

## Coverage of the web plugin

| Skill | Cases | Notes |
|---|---|---|
| browser-probe | 4 real sites | recipe must match the probe report and load the page |
| page-langs | 2 fixtures, 2 real | `langs.json` vs known languages and declarations |
| page-collect | 3 fixture tasks, 1 real | metadata, forms, videos, socials, icons vs the fixture markup |
| page-tree | 2 fixture, 1 real | grid, gradient, image background, fixed banner, `minWidth` |
| page-reduce | 2 fixture, 1 real | 5 sections, `{REPEAT:2}`, no scripts, phase 1 only |
| page-prep | 2 fixtures, 1 real | checked in the agent's own browser: overlay gone, nothing accepted |
| cdp-connect | 4 fixture tasks | headless Chrome on 9222: form, screenshot, network, accessibility |
| cdp-ext-pilot | 3 fixture tasks | tiny MV3 extension: side panel, options page, extension id |
| domain-mask | none | needs sudo, `/etc/hosts` and port 443; not run unattended |

Add a model: one entry in `models.yaml`. Add a skill: `skills/<name>/` with a config, cases,
assertions and `skill.yaml`.

## Sources

No external sources. Provider behaviour follows https://www.promptfoo.dev/docs/guides/test-agent-skills/
and Pi's SDK docs (https://pi.dev/docs/latest/sdk).
