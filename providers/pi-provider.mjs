import { cpSync, mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import {
  createAgentSession,
  DefaultResourceLoader,
  getAgentDir,
  ModelRuntime,
  SessionManager,
} from '@earendil-works/pi-coding-agent';

/**
 * promptfoo provider that runs one Pi coding-agent session per call.
 *
 * Config: model_label (a label from models.yaml, supplies provider/model/thinking) or
 * provider, model, thinking (off|low|medium|high); working_dir,
 * workspace_root (run in a kept copy of working_dir under this directory),
 * skills (paths of skill folders; discovery is
 * otherwise disabled), tools (names), timeout_ms.
 * A session that exceeds timeout_ms is aborted and returned as a normal (failing)
 * result with metadata.timedOut; only provider/API failures surface as errors.
 * Reports `metadata.toolCalls` and `metadata.skillCalls` (a `read` of a
 * loaded skill's SKILL.md) in the same shape as promptfoo's Claude provider.
 */
export default class PiProvider {
  constructor(options) {
    const config = options.config ?? {};
    this.config = config.model_label ? { ...modelByLabel(config.model_label), ...config } : config;
  }

  id() {
    const { provider, model, thinking = 'off' } = this.config;
    return `pi:${provider}/${model}:${thinking}`;
  }

  async callApi(prompt) {
    const { provider, model, thinking = 'off', skills = [], tools, timeout_ms: timeoutMs = 600_000 } = this.config;
    if (!provider || !model) throw new Error('pi provider: config.provider and config.model are required');

    const cwd = this.#prepareWorkspace();
    const skillPaths = skills.map((p) => resolve(p));
    const modelRuntime = await ModelRuntime.create();
    const piModel = modelRuntime.getModel(provider, model);
    if (!piModel) throw new Error(`pi provider: model ${provider}/${model} not found in Pi's model registry`);

    const loader = new DefaultResourceLoader({
      cwd,
      agentDir: getAgentDir(),
      noExtensions: true,
      noContextFiles: true,
      noPromptTemplates: true,
      noThemes: true,
      noSkills: true,
      additionalSkillPaths: skillPaths,
    });
    await loader.reload();

    const { session } = await createAgentSession({
      cwd,
      model: piModel,
      thinkingLevel: thinking,
      modelRuntime,
      resourceLoader: loader,
      sessionManager: SessionManager.inMemory(cwd),
      ...(tools && { tools }),
    });

    const toolCalls = [];
    const skillNames = skillPaths.map((p) => basename(p));
    session.subscribe((event) => {
      if (event.type !== 'tool_execution_start') return;
      toolCalls.push({ name: event.toolName, input: event.args });
    });

    const timedOut = Symbol('timeout');
    let timer;
    try {
      const outcome = await Promise.race([
        session.prompt(prompt),
        new Promise((resolveTimeout) => { timer = setTimeout(() => resolveTimeout(timedOut), timeoutMs); }),
      ]);
      if (outcome === timedOut) await session.abort();
      const stats = session.getSessionStats();
      return {
        output: session.getLastAssistantText() ?? '',
        cost: stats.cost,
        tokenUsage: {
          total: stats.tokens.total,
          prompt: stats.tokens.input,
          completion: stats.tokens.output,
        },
        metadata: {
          workingDir: cwd,
          timedOut: outcome === timedOut,
          toolCalls,
          skillCalls: skillCallsFrom(toolCalls, skillNames),
          loadedSkills: loader.getSkills().skills.map((s) => ({ name: s.name, filePath: s.filePath })),
        },
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    } finally {
      clearTimeout(timer);
      session.dispose();
    }
  }

  /** With `workspace_root`, each run gets a kept copy of `working_dir` so assertions can read its files. */
  #prepareWorkspace() {
    const dir = resolve(this.config.working_dir ?? '.');
    if (!this.config.workspace_root) return dir;
    const root = resolve(this.config.workspace_root);
    mkdirSync(root, { recursive: true });
    const copy = join(mkdtempSync(join(root, 'run-')), 'workspace');
    cpSync(dir, copy, { recursive: true });
    return copy;
  }
}

function modelByLabel(label) {
  const file = fileURLToPath(new URL('../models.yaml', import.meta.url));
  const entry = parse(readFileSync(file, 'utf-8')).find((m) => m.label === label);
  if (!entry) throw new Error(`pi provider: model_label "${label}" not found in ${file}`);
  const { provider, model, thinking } = entry;
  return { provider, model, thinking };
}

/** Pi has no Skill tool: a skill is "used" when the model reads its SKILL.md, via `read` or a shell command. */
function skillCallsFrom(toolCalls, skillNames) {
  return toolCalls.flatMap((c) => {
    const target = c.name === 'read' ? String(c.input?.path ?? '') : c.name === 'bash' ? String(c.input?.command ?? '') : '';
    return skillNames
      .filter((n) => target.includes(`${n}/SKILL.md`))
      .map((name) => ({ name, input: c.input, source: 'tool' }));
  });
}
