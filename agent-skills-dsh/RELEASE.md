# Release / dsh-market inclusion metadata

Copy-paste values for publishing this repo so it is discoverable and
installable as an official bundle plugin.

## Repository description

```
DSH plugin: 24 production-grade engineering skills + 4 review personas with 8 lifecycle slash commands; official bundle, install via `dsh plugin --profile web add` `github:huaihuaixiaozi/liuchubby`
```

## GitHub topics

```sh
gh repo edit huaihuaixiaozi/liuchubby \
  --add-topic dsh-plugin \
  --add-topic dsh-bundle \
  --add-topic deepseek-harness \
  --add-topic skill \
  --add-topic skills \
  --add-topic agents
```

## dsh-market listing (awesome-dsh-plugin PR)

The market (`dsh-market/dsh-market`) reads the curated list
`awesome-dsh-plugin/awesome-dsh-plugin`. To list this plugin, open a PR there
adding one file `data/plugins/huaihuaixiaozi__liuchubby.yml`:

```yaml
url: https://github.com/huaihuaixiaozi/liuchubby
name: huaihuaixiaozi/liuchubby
category: skill
description:
  en: 24 engineering workflow skills, 4 review personas, and 8 lifecycle slash commands for DeepSeek Harness.
  zh: DeepSeek Harness 的 24 个工程工作流技能、4 个评审 persona 与 8 条生命周期斜杠命令。
```

## Release checklist

- [ ] `package.json#main` / `exports["."]` point at `index.mjs`
- [ ] `dsh.bundle.patch` points at `cordis.patch.yml`
- [ ] `dsh.skills` lists all 28 `SKILL.md` paths
- [ ] Gate passes: `npm run smoke` (exit 0)
- [ ] `README.md` has install, usage, and capability tables (Skills + Commands)
- [ ] Repository description and topics set (above)
- [ ] Install smoke: `dsh plugin --profile web add github:huaihuaixiaozi/liuchubby`, restart web, then `/spec` fires `spec-driven-development`

## Install notes

- **Git install needs no build authorization.** This package is plain ESM
  (`index.mjs` + `skills/`), no TypeScript build and no `prepare` script, so
  `dsh plugin --profile web add github:huaihuaixiaozi/liuchubby` works without a
  pnpm `allowBuilds` entry.
- For a local/dev install: `dsh plugin --profile web add ./dsh-agent-skills`.