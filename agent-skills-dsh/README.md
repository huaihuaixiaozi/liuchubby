<h1 align="center">dsh-agent-skills</h1>

<p align="center">24 个生产级工程技能 + 4 个评审 persona，作为 DeepSeek Harness
技能包与 8 条生命周期斜杠命令分发。由 <a href="https://github.com/addyosmani/agent-skills">addyosmani/agent-skills</a>
转换而来。</p>

DeepSeek Harness 插件。标准 bundle 形态，安装（本包位于仓库子目录
`agent-skills-dsh/`，spec 需带 `#path:/agent-skills-dsh`）：

```sh
dsh plugin --profile web add github:huaihuaixiaozi/liuchubby#path:/agent-skills-dsh
# 或本地目录 / tarball
dsh plugin --profile web add ./agent-skills-dsh
```

装完**重启 web**。技能通过 `dsh.skills` 声明随包分发，8 条命令由
`cordis.patch.yml` 挂载的 Node 入口注册。git 安装**无需构建授权**（纯 ESM、
无 `prepare` 脚本）。安装前自检：`npm run smoke`。

## Skills（28）

24 个生命周期技能 + 4 个评审 persona，全部以 `skills/<name>/SKILL.md` 形式
随包分发，由模型的 `skill` 工具按需加载。

| Skill | 作用 |
|---|---|
| `using-agent-skills` | 元技能：把任务路由到正确的技能并定义共享操作规则 |
| `interview-me` | 一次一问的需求访谈，逼近用户真正想要的 |
| `idea-refine` | 发散/收敛式结构化思考，把模糊想法打磨成可落地提案 |
| `spec-driven-development` | 编码前先写结构化规格（PRD） |
| `planning-and-task-breakdown` | 把规格拆成小、可验证、带依赖排序的任务 |
| `incremental-implementation` | 薄垂直切片式增量实现 |
| `test-driven-development` | 红-绿-重构，测试金字塔 |
| `context-engineering` | 在正确时机给 agent 正确上下文 |
| `source-driven-development` | 每个框架决策都以官方文档为据并标注来源 |
| `doubt-driven-development` | 对每个非平凡决策做对抗式复查（CLAIM→DOUBT→RECONCILE） |
| `frontend-ui-engineering` | 组件架构、设计系统、响应式与 WCAG 2.1 AA |
| `api-and-interface-design` | 契约先行、Hyrum 定律、错误语义、边界校验 |
| `browser-testing-with-devtools` | 用 Chrome DevTools MCP 抓运行时数据 |
| `debugging-and-error-recovery` | 五步排障：复现→定位→收敛→修复→守护 |
| `code-review-and-quality` | 五轴评审、改动粒度、严重度标签 |
| `code-simplification` | 保持行为不变的前提下降低复杂度 |
| `security-and-hardening` | OWASP Top 10、鉴权、密钥、依赖审计 |
| `performance-optimization` | 先测量再优化，CWV 目标与反模式 |
| `git-workflow-and-versioning` | 主干开发、原子提交、改动粒度 |
| `ci-cd-and-automation` | Shift Left、feature flag、质量门禁流水线 |
| `deprecation-and-migration` | 代码即负债、弃用与迁移模式 |
| `documentation-and-adrs` | ADR、API 文档、记录「为什么」 |
| `observability-and-instrumentation` | 结构化日志、RED 指标、OTel 追踪、症状告警 |
| `shipping-and-launch` | 上线前清单、分阶段发布、回滚策略、并行评审 fan-out |
| `code-reviewer` | persona：五轴资深评审 |
| `security-auditor` | persona：漏洞检测、威胁建模、OWASP |
| `test-engineer` | persona：测试策略与覆盖率分析 |
| `web-performance-auditor` | persona：CWV 审计（Quick/Deep 两档，度量诚实规则） |

## Commands（8）

每条命令是一个薄激活器：把对应技能加载指令排入一个用户轮次，返回确认。

| 命令 | 激活技能 |
|---|---|
| `/spec` | `spec-driven-development` |
| `/plan` | `planning-and-task-breakdown` |
| `/build` | `incremental-implementation` |
| `/test` | `test-driven-development` |
| `/review` | `code-review-and-quality` |
| `/webperf` | `web-performance-auditor` |
| `/code-simplify` | `code-simplification` |
| `/ship` | `shipping-and-launch`（含 3 persona 并行 fan-out） |

## 从 agent-skills 转换时处理的三个坑

1. **共享 `references/` 跨目录引用**：原仓库 7 份清单放在仓库根 `references/`，
   技能正文用 `../../references/<x>.md` 引用，超出 DSH skill 的 resourceBase。
   已把每份清单**复制进用到它的技能目录** `skills/<name>/references/` 并把
   链接改写为 `references/<x>.md`，使每个技能自包含、可独立分发。
2. **persona 与 `/ship` 编排**：4 个 `agents/*.md` 转成普通技能
   （`code-reviewer` 等），可被同一 `skill` 工具发现；`/ship` 的并行 fan-out
   编排写进了 `shipping-and-launch` 技能正文（`Review Fan-out` 一节），其余
   7 条命令保持薄激活器。跨技能路径引用统一改为裸技能名。
3. **shell 脚本与 hooks**：`idea-refine` 的 bash 脚本内联为 `mkdir -p
   docs/ideas`；Claude Code 专属的 `hooks/`（sdd-cache 等）不进入 DSH 插件，
   直接丢弃。

## 说明与回退

- 技能经 `package.json#dsh.skills` 声明（dsh-market 的 skill 包契约）。若你
  安装的 dsh 版本未识别该字段，回退方案是把 `skills/` 整体复制到
  `<dshHome>/skills/`（本地文件系统 provider 会扫描该目录）。
- `recordInput: false`：命令的原始输入由 follow-up 消息转发给模型，不在
  `command/run` 事件里重复记录。
- 本包只依赖官方运行时闭包注入的 `@deepseek-ai/dsh-llm`（`createUserMessage`），
  package.json 不声明任何 `@deepseek-ai/*` 依赖。

## 插件管理

已装插件用 plugin-registry 的薄控制台管理（浏览器面板）：

```sh
dsh plugin --profile web add <plugin-registry>/packages/plugin/console
```

## License

MIT — 源自 [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)。

## 发布与收录

仓库 description、topics 标签与发布检查清单见 [RELEASE.md](./RELEASE.md)。