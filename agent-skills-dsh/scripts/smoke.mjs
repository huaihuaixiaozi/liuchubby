#!/usr/bin/env node
/**
 * Minimal packaging smoke test for the dsh-agent-skills bundle.
 *
 * Dependency-free (Node built-ins only). Validates the contract that matters
 * before `dsh plugin --profile web add`:
 *
 *   1. package.json parses and declares `dsh.bundle.patch` + `dsh.skills`.
 *   2. Every `dsh.skills` entry points at an existing SKILL.md on disk.
 *   3. Every skill is self-contained: frontmatter `name` is kebab-case and
 *      matches the directory, `description` is present, and the body does not
 *      escape the skill directory (`../../references/`, backtick-quoted
 *      `skills/` paths, stale `docs/agents.md`, or the old shell script).
 *   4. `cordis.patch.yml` inserts exactly one row naming this package.
 *   5. `index.mjs` exists and exports the Cordis entry contract.
 *
 * Usage:  node scripts/smoke.mjs        (exit 0 = pass, 1 = fail)
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const pkgRoot = fileURLToPath(new URL('..', import.meta.url))

const failures = []
let checks = 0

function check(name, ok, detail = '') {
  checks += 1
  if (ok) {
    console.log(`  ok  ${name}${detail ? ` — ${detail}` : ''}`)
  } else {
    failures.push(name)
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

/** Extract the YAML frontmatter key/value pairs, if any. */
function parseFrontmatter(text) {
  const block = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n/)
  if (block === null) return {}
  const out = {}
  for (const line of block[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):[ \t]*(.*)$/)
    if (kv !== null) out[kv[1]] = kv[2].trim()
  }
  return out
}

// ---- 1. package.json -------------------------------------------------------
console.log('dsh-agent-skills smoke test\n')

let pkg
try {
  pkg = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
  check('package.json parses', true, `${pkg.name}@${pkg.version}`)
} catch (err) {
  check('package.json parses', false, String(err))
  console.log(`\n${failures.length} failure(s) out of ${checks} checks.`)
  process.exit(1)
}

const bundlePatch = pkg.dsh?.bundle?.patch
check('dsh.bundle.patch declared', typeof bundlePatch === 'string' && bundlePatch.length > 0, String(bundlePatch))
check('bundle patch file exists', typeof bundlePatch === 'string' && existsSync(join(pkgRoot, bundlePatch)), String(bundlePatch))

const skills = pkg.dsh?.skills
check('dsh.skills declared as non-empty array', Array.isArray(skills) && skills.length > 0, `count=${skills?.length}`)
check('main points at index.mjs', pkg.main === './index.mjs', String(pkg.main))

// ---- 2. every declared skill file exists ----------------------------------
const skillFiles = []
if (Array.isArray(skills)) {
  for (const rel of skills) {
    const abs = join(pkgRoot, rel)
    const exists = existsSync(abs)
    check(`skill exists: ${rel}`, exists)
    if (exists) {
      const parts = rel.replace(/\\/g, '/').split('/')
      skillFiles.push({ dir: parts[parts.length - 2] ?? '', file: abs })
    }
  }
}

// ---- 3. self-contained skills ---------------------------------------------
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ESCAPES = [
  ['../../references/', 'escaped shared reference'],
  ['`skills/', 'cross-skill path reference'],
  ['docs/agents.md', 'stale docs link'],
  ['idea-refine.sh', 'shell-script reference'],
]

for (const { dir, file } of skillFiles) {
  const text = readFileSync(file, 'utf8')
  const fm = parseFrontmatter(text)
  const name = fm.name ?? ''
  const desc = fm.description ?? ''
  check(`${dir}: frontmatter name is kebab-case`, KEBAB.test(name), name || '(missing)')
  check(`${dir}: frontmatter name matches directory`, name === dir, name)
  check(`${dir}: description present`, desc.trim().length > 0)
  for (const [pattern, what] of ESCAPES) {
    if (text.includes(pattern)) check(`${dir}: no ${what}`, false, `found "${pattern}"`)
  }
}

// ---- 4. cordis.patch.yml --------------------------------------------------
const patch = readFileSync(join(pkgRoot, 'cordis.patch.yml'), 'utf8')
const insertCount = (patch.match(/^[ \t]*- insert:[ \t]*$/gm) ?? []).length
check('cordis.patch.yml has exactly one insert', insertCount === 1, `insert=${insertCount}`)
const idCount = (patch.match(/^[ \t]*- id:[ \t]*\S+[ \t]*$/gm) ?? []).length
check('cordis.patch.yml has exactly one row id', idCount === 1, `id=${idCount}`)
const nameMatch = patch.match(/^[ \t]*name:[ \t]*(\S+)[ \t]*$/m)
check('cordis.patch.yml names this package', nameMatch?.[1] === pkg.name, nameMatch?.[1])

// ---- 5. index.mjs entry contract ------------------------------------------
const entry = readFileSync(join(pkgRoot, 'index.mjs'), 'utf8')
check('index.mjs exports name', /export const name\s*=/.test(entry))
check('index.mjs exports inject', /export const inject\s*=/.test(entry))
check('index.mjs exports apply', /export function apply\s*\(/.test(entry))

// ---- summary ---------------------------------------------------------------
if (failures.length > 0) {
  console.log(`\n${failures.length} of ${checks} checks failed:`)
  for (const name of failures) console.log(`  - ${name}`)
  process.exit(1)
}
console.log(`\nAll ${checks} checks passed.`)