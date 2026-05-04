# opencode-autoskills

> **OpenCode plugin by encode90 that saves setup time by detecting, selecting, and installing AI skills from a single command.**

One setup. Type `/autoskills`. Pick what you want in plain language. Keep your project moving.

---

## ⚡ Why this project exists

`opencode-autoskills` turns a repetitive setup task into a fast OpenCode workflow:

- detect the stack
- show suggested skills
- let you choose what stays
- install everything into `.agents/skills/`

The result: **less manual setup, less context switching, and faster onboarding for the current project.**

---

## 🧠 How it works

```
/autoskills
  → OpenCode calls the autoskills tool
  → The tool runs a real dry-run detection
  → You choose what to keep
  → You can answer with natural language or list numbers
  → The tool installs and filters the final set
  → Skills installed to .agents/skills/
  → OpenCode discovers them automatically
```

Examples of valid replies after detection:

```text
install 1, 3, 4
```

```text
keep vitest, typescript-advanced-types, accessibility
```

```text
all except 2
```

---

## 🚀 Installation

## Quick path

### 1. Setup once

```bash
npx opencode-autoskills setup
```

This registers the `/autoskills` command globally (`~/.config/opencode/commands/`).
It also adds `opencode-autoskills` to your global OpenCode `plugin` array (`~/.config/opencode/opencode.json`) so the custom tool is available.

For per-project setup:

```bash
npx opencode-autoskills setup --local
```

### 2. Use it

Open OpenCode in any project and type:

```
/autoskills
```

Or just tell the AI:

```text
install skills for this project
```

When the tool shows the list, reply in either of these styles:

```text
keep 1, 3, 4, 6
```

```text
keep vitest, accessibility, seo
```

---

## 📦 Distribution

- **Landing page**: https://encode90.github.io/opencode-autoskills/
- **npm**: `opencode-autoskills`
- **GitHub**: this repo

### Requirements

- Node.js >= 22.6.0
- OpenCode with the `@opencode-ai/plugin` peer dependency

---

## 🛡️ Security

- **No `postinstall` scripts** — setup is always explicit, never automatic
- **No runtime dependencies** — only `@opencode-ai/plugin` as a peer dependency
- **No file system writes outside intended paths** — path traversal prevention in setup CLI
- **Explicit OpenCode registration** — setup writes the command file and adds the plugin to `opencode.json`, or a local plugin wrapper for project mode
- **Real execution flow** — the custom tool performs detection and installation instead of returning a prompt-only instruction

---

## 📁 Project structure

```
opencode-autoskills/
├── src/
│   ├── index.ts          # Plugin entry → exports autoskills tool
│   ├── tool.ts           # Tool definition
│   ├── version.ts        # Node version validation
│   └── cli.ts            # Setup CLI logic
├── bin/
│   └── setup.mjs         # CLI entry point
├── tests/
│   ├── tool.test.ts
│   └── setup-cli.test.ts
└── .github/workflows/
    └── ci.yml            # CI matrix: Win + Mac + Linux
```

---

## 🙏 Credit

This project integrates [autoskills](https://github.com/midudev/autoskills) into OpenCode. That upstream project provides the detection and installation engine; `opencode-autoskills` focuses on the OpenCode workflow, project-local setup, and time-saving selection flow.

---

## 📄 License

[CC BY-NC 4.0](LICENSE) — same license as [autoskills](https://github.com/midudev/autoskills).  
