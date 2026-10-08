# Skill eval report

8 skills, 5 models, 555 runs. Models are ordered from lowest to highest tier.
Each cell is the share of runs that passed within the skill's time budget; ✓ means it meets the skill's floor
(see each section), ✗ that it does not, · that the model was not run. Numbers rest on small samples (9 to 27 runs
per cell): treat gaps of a few points as noise. Live sites drift, so rerun before relying on one result.

| Skill | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low (baseline) | Lowest model meeting the floor |
|---|---|---|---|---|---|---|
| [browser-probe](#browser-probe) | ✗ 50% (6/12) | ✗ 42% (5/12) | ✓ 100% (24/24) | ✓ 92% (11/12) | ✓ 100% (12/12) | **haiku-5.5-low** |
| [cdp-connect](#cdp-connect) | ✓ 94% (17/18) | ✓ 94% (17/18) | ✓ 100% (18/18) | ✓ 94% (17/18) | ✓ 100% (18/18) | **gemma-4-26b-cf** |
| [cdp-ext-pilot](#cdp-ext-pilot) | ✓ 100% (9/9) | ✗ 89% (8/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | **gemma-4-26b-cf** |
| [page-collect](#page-collect) | ✗ 72% (13/18) | ✗ 72% (13/18) | ✗ 78% (14/18) | ✓ 100% (18/18) | ✓ 100% (18/18) | **gpt-6-sol-low** |
| [page-langs](#page-langs) | ✓ 95% (20/21) | ✗ 76% (16/21) | ✓ 100% (21/21) | ✓ 100% (21/21) | ✓ 100% (21/21) | **gemma-4-26b-cf** |
| [page-prep](#page-prep) | ✗ 22% (2/9) | ✗ 33% (3/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | ✓ 93% (25/27) | **haiku-5.5-low** |
| [page-reduce](#page-reduce) | ✗ 33% (3/9) | ✗ 33% (3/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | **haiku-5.5-low** |
| [page-tree](#page-tree) | ✗ 56% (5/9) | ✗ 56% (5/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | ✓ 100% (9/9) | **haiku-5.5-low** |

## browser-probe

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices, fix-web-skills-best-practices@b3aa00ec.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 12 | 58% | ✗ 50% (6/12) | 104 | 121 | 7 | 0.005 |
| qwen3.8-27b-cf | 12 | 75% | ✗ 42% (5/12) | 145 | 441 | 0 | 0.048 |
| haiku-5.5-low | 24 | 100% | ✓ 100% (24/24) | 28 | 42 | 0 | 0.002 |
| gpt-6-sol-low | 12 | 92% | ✓ 92% (11/12) | 26 | 38 | 0 | 0.023 |
| sonnet-5.5-low (baseline) | 12 | 100% | ✓ 100% (12/12) | 31 | 44 | 0 | 0.035 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| wknd | 100% (3/3) | 33% (1/3) | 100% (6/6) | 100% (3/3) | 100% (3/3) |
| astrazeneca | 67% (2/3) | 67% (2/3) | 100% (6/6) | 100% (3/3) | 100% (3/3) |
| adobe | 0% (0/3) | 67% (2/3) | 100% (6/6) | 100% (3/3) | 100% (3/3) |
| bd | 33% (1/3) | 0% (0/3) | 100% (6/6) | 67% (2/3) | 100% (3/3) |

**Most common failures**

- 6× gemma-4-26b-cf: timed out
- 4× qwen3.8-27b-cf: unknown
- 2× gpt-5.4-mini: no recipe to load with
- 1× qwen3.8-27b-cf: recipe url https://wknd.site != https://wknd.site/
- 1× qwen3.8-27b-cf: recipe does not match default: stealth script, user-agent arg
- 1× gpt-5.4-mini: recipe does not match persistent: persistent flag

## cdp-connect

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 18 | 94% | ✓ 94% (17/18) | 51 | 120 | 1 | 0.003 |
| qwen3.8-27b-cf | 18 | 94% | ✓ 94% (17/18) | 56 | 120 | 1 | 0.013 |
| haiku-5.5-low | 18 | 100% | ✓ 100% (18/18) | 12 | 30 | 0 | 0.001 |
| gpt-6-sol-low | 18 | 94% | ✓ 94% (17/18) | 16 | 120 | 1 | 0.014 |
| sonnet-5.5-low (baseline) | 18 | 100% | ✓ 100% (18/18) | 11 | 20 | 0 | 0.019 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| fill and submit the greeter form | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| screenshot | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| network request on load | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| accessible buttons | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| several tabs, click in the right one | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| console output after a reload | 67% (2/3) | 67% (2/3) | 100% (3/3) | 67% (2/3) | 100% (3/3) |

**Most common failures**

- 1× gemma-4-26b-cf: timed out
- 1× qwen3.8-27b-cf: timed out
- 1× gpt-6-sol-low: timed out

## cdp-ext-pilot

Floor: ≥ 90% of runs pass within 150 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 9 | 100% | ✓ 100% (9/9) | 57 | 84 | 0 | 0.005 |
| qwen3.8-27b-cf | 9 | 89% | ✗ 89% (8/9) | 98 | 150 | 1 | 0.021 |
| haiku-5.5-low | 9 | 100% | ✓ 100% (9/9) | 11 | 18 | 0 | 0.002 |
| gpt-6-sol-low | 9 | 100% | ✓ 100% (9/9) | 15 | 25 | 0 | 0.020 |
| sonnet-5.5-low (baseline) | 9 | 100% | ✓ 100% (9/9) | 13 | 20 | 0 | 0.023 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| sidepanel, save a note | 100% (3/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| options page screenshot | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| extension id | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

**Most common failures**

- 1× qwen3.8-27b-cf: timed out

## page-collect

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 18 | 72% | ✗ 72% (13/18) | 38 | 57 | 0 | 0.002 |
| qwen3.8-27b-cf | 18 | 83% | ✗ 72% (13/18) | 89 | 121 | 9 | 0.018 |
| haiku-5.5-low | 18 | 78% | ✗ 78% (14/18) | 13 | 24 | 0 | 0.002 |
| gpt-6-sol-low | 18 | 100% | ✓ 100% (18/18) | 13 | 18 | 0 | 0.020 |
| sonnet-5.5-low (baseline) | 18 | 100% | ✓ 100% (18/18) | 11 | 18 | 0 | 0.023 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| fixture, full inventory | 100% (3/3) | 33% (1/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, icons for Edge Delivery Services | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, forms only | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| aem.live, full inventory | 100% (3/3) | 100% (3/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) |
| fixture, icons from sprites, data URIs and inline SVG | 0% (0/3) | 0% (0/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) |
| fixture, JSON-LD structured data | 33% (1/3) | 100% (3/3) | 33% (1/3) | 100% (3/3) | 100% (3/3) |

**Most common failures**

- 5× qwen3.8-27b-cf: timed out
- 3× gemma-4-26b-cf: failed checks: icons recolored to currentColor
- 2× haiku-5.5-low: failed checks: organization found
- 2× gemma-4-26b-cf: failed checks: organization found
- 1× haiku-5.5-low: failed checks: icons recolored to currentColor
- 1× haiku-5.5-low: failed checks: all six collectors present

## page-langs

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 21 | 95% | ✓ 95% (20/21) | 70 | 101 | 1 | 0.005 |
| qwen3.8-27b-cf | 21 | 100% | ✗ 76% (16/21) | 75 | 120 | 5 | 0.021 |
| haiku-5.5-low | 21 | 100% | ✓ 100% (21/21) | 9 | 13 | 0 | 0.001 |
| gpt-6-sol-low | 21 | 100% | ✓ 100% (21/21) | 14 | 19 | 0 | 0.020 |
| sonnet-5.5-low (baseline) | 21 | 100% | ✓ 100% (21/21) | 9 | 12 | 0 | 0.018 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| fixture, nested lang attribute (en page with a German block) | 100% (3/3) | 33% (1/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, French page with no language markup | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, too little text to detect a language | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, English page declared en | 100% (3/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, es+de body declared en with hreflang fr | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| es.wikipedia.org/wiki/Madrid (Spanish) | 100% (3/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| aem.live (English) | 100% (3/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

**Most common failures**

- 5× qwen3.8-27b-cf: timed out
- 1× gemma-4-26b-cf: timed out

## page-prep

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 9 | 33% | ✗ 22% (2/9) | 93 | 123 | 3 | 0.012 |
| qwen3.8-27b-cf | 9 | 56% | ✗ 33% (3/9) | 116 | 123 | 7 | 0.055 |
| haiku-5.5-low | 9 | 100% | ✓ 100% (9/9) | 31 | 46 | 0 | 0.007 |
| gpt-6-sol-low | 9 | 100% | ✓ 100% (9/9) | 27 | 42 | 0 | 0.055 |
| sonnet-5.5-low (baseline) | 27 | 93% | ✓ 93% (25/27) | 33 | 120 | 2 | 0.091 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| fixture, cookie banner (reject, never accept) | 0% (0/3) | 33% (1/3) | 100% (3/3) | 100% (3/3) | 100% (9/9) |
| fixture, newsletter modal with scroll lock | 67% (2/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (9/9) |
| 20minutes.fr consent wall | 0% (0/3) | 0% (0/3) | 100% (3/3) | 100% (3/3) | 78% (7/9) |

**Most common failures**

- 6× qwen3.8-27b-cf: timed out
- 3× gemma-4-26b-cf: failed checks: did not accept tracking
- 3× gemma-4-26b-cf: timed out
- 2× sonnet-5.5-low: timed out
- 1× gemma-4-26b-cf: failed checks: no blocking fixed overlay left

## page-reduce

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 9 | 33% | ✗ 33% (3/9) | 112 | 121 | 7 | 0.006 |
| qwen3.8-27b-cf | 9 | 33% | ✗ 33% (3/9) | 116 | 120 | 7 | 0.025 |
| haiku-5.5-low | 9 | 100% | ✓ 100% (9/9) | 35 | 78 | 0 | 0.005 |
| gpt-6-sol-low | 9 | 100% | ✓ 100% (9/9) | 35 | 45 | 0 | 0.050 |
| sonnet-5.5-low (baseline) | 9 | 100% | ✓ 100% (9/9) | 23 | 36 | 0 | 0.061 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| fixture, full reduction | 0% (0/3) | 0% (0/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, phase 1 only | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| aem.live, full reduction | 0% (0/3) | 0% (0/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

**Most common failures**

- 6× qwen3.8-27b-cf: timed out
- 6× gemma-4-26b-cf: timed out

## page-tree

Floor: ≥ 90% of runs pass within 120 s. Skill ref: fix-web-skills-best-practices.

| Model | Runs | Passed | Within floor | Avg s | p95 s | Timeouts | $/run |
|---|---|---|---|---|---|---|---|
| gemma-4-26b-cf | 9 | 67% | ✗ 56% (5/9) | 108 | 120 | 4 | 0.008 |
| qwen3.8-27b-cf | 9 | 67% | ✗ 56% (5/9) | 101 | 121 | 5 | 0.026 |
| haiku-5.5-low | 9 | 100% | ✓ 100% (9/9) | 15 | 24 | 0 | 0.002 |
| gpt-6-sol-low | 9 | 100% | ✓ 100% (9/9) | 20 | 26 | 0 | 0.022 |
| sonnet-5.5-low (baseline) | 9 | 100% | ✓ 100% (9/9) | 13 | 15 | 0 | 0.026 |

**By case** (share of runs within the floor)

| Case | gemma-4-26b-cf | qwen3.8-27b-cf | haiku-5.5-low | gpt-6-sol-low | sonnet-5.5-low |
|---|---|---|---|---|---|
| fixture, default capture | 67% (2/3) | 33% (1/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| fixture, narrow elements included | 67% (2/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |
| aem.live, default capture | 33% (1/3) | 67% (2/3) | 100% (3/3) | 100% (3/3) | 100% (3/3) |

**Most common failures**

- 4× qwen3.8-27b-cf: timed out
- 4× gemma-4-26b-cf: timed out

## How to read this

- A run passes when every scored assertion holds: the skill was loaded, the files or answer match the ground
  truth, and (for browser tasks) the page is really in the expected state. Slower than the budget counts as a failure.
- The baseline model must meet a skill's floor before other models are run (`scripts/run.sh`). A ⚠ marks a baseline
  that does not, which means the skill or its eval needs work before the other rows mean anything.
- "Lowest model meeting the floor" uses the model order in `models.yaml`, which is a judgment call, not a benchmark.
- Raw promptfoo results stay in `output/`; `npx promptfoo view` browses the evals run on this machine.
