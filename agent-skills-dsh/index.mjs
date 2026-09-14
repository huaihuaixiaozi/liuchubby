/**
 * dsh-agent-skills — DeepSeek Harness bundle.
 *
 * Node half registers eight lifecycle slash commands. Each command is a thin
 * activator: it queues a follow-up turn that loads the matching skill via the
 * model-facing `skill` tool, then returns a success acknowledgement. The skills
 * themselves are declared in `package.json#dsh.skills` and shipped under
 * `skills/`; the four review personas are shipped as ordinary skills so they
 * are discoverable by the same `skill` tool (a `/ship` fan-out loads them in
 * parallel from the `shipping-and-launch` skill body).
 *
 * @module dsh-agent-skills
 */

import { createUserMessage } from '@deepseek-ai/dsh-llm'

export const name = 'dsh-agent-skills'
export const inject = ['commands']

/** One lifecycle slash command mapped to the skill it activates. */
const COMMANDS = [
  {
    name: 'spec',
    skill: 'spec-driven-development',
    description: 'Write a structured specification before writing code.',
    hint: '[feature or change to specify]',
  },
  {
    name: 'plan',
    skill: 'planning-and-task-breakdown',
    description: 'Decompose a spec into small, atomic, verifiable tasks.',
    hint: '[spec or feature to plan]',
  },
  {
    name: 'build',
    skill: 'incremental-implementation',
    description: 'Build incrementally, one thin vertical slice at a time.',
    hint: '[task or plan to implement]',
  },
  {
    name: 'test',
    skill: 'test-driven-development',
    description: 'Prove it works — red-green-refactor, tests first.',
    hint: '[code or bug to test]',
  },
  {
    name: 'review',
    skill: 'code-review-and-quality',
    description: 'Five-axis code review before merge.',
    hint: '[change, PR, or files to review]',
  },
  {
    name: 'webperf',
    skill: 'web-performance-auditor',
    description: 'Audit web performance against Core Web Vitals.',
    hint: '[url or files to audit]',
  },
  {
    name: 'code-simplify',
    skill: 'code-simplification',
    description: 'Simplify code while preserving exact behavior.',
    hint: '[code to simplify]',
  },
  {
    name: 'ship',
    skill: 'shipping-and-launch',
    description: 'Run the pre-launch checklist and produce a go/no-go decision.',
    hint: '[change to ship]',
  },
]

/**
 * Queue the activation prompt as an ordinary user turn and acknowledge.
 * @param {object} def - command definition ({@link COMMANDS} entry).
 * @param {import('@deepseek-ai/dsh-commands').CommandInvocation} invocation - receiving agent + input.
 * @returns {import('@deepseek-ai/dsh-commands').CommandResult} success acknowledgement.
 */
function runCommand(def, invocation) {
  const extra = invocation.rawInput.trim()
  const text = extra.length > 0
    ? `Use the \`skill\` tool to load the \`${def.skill}\` skill, then follow it exactly for this task.\n\nUser input: ${extra}`
    : `Use the \`skill\` tool to load the \`${def.skill}\` skill, then follow it exactly for this task.`
  invocation.agent.followup(createUserMessage({
    content: [{ type: 'text', text }],
    source: { kind: 'user' },
  }))
  return { kind: 'success', text: `Starting ${def.name} (skill: ${def.skill}).` }
}

/**
 * Register the eight lifecycle commands.
 * @param {import('@deepseek-ai/cordis').Context} ctx - host context carrying `ctx.commands`.
 */
export function apply(ctx) {
  for (const def of COMMANDS) {
    ctx.commands.register({
      name: def.name,
      description: def.description,
      input: { hint: def.hint },
      recordInput: false,
      handler: (invocation) => runCommand(def, invocation),
    })
  }
}