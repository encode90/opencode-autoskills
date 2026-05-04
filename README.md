# opencode-autoskills

> **OpenCode plugin that brings [autoskills](https://github.com/midudev/autoskills) into your AI coding workflow.**

One setup. Type `/autoskills`. Your AI agent installs the best skills for your stack.

---

## ⚡ Powered by autoskills

**This project is a thin wrapper around [midudev/autoskills](https://github.com/midudev/autoskills)** — the engine that scans your project, detects technologies, and installs curated AI agent skills.

We don't maintain a skill catalog. We don't write detection logic. **autoskills does all the heavy lifting.** We just make it discoverable and frictionless inside OpenCode.

> 💙 Huge thanks to [**midudev**](https://midu.dev) for building and maintaining [autoskills](https://autoskills.sh). This project wouldn't exist without it.

---

## 🧠 How it works

```
/autoskills
  → OpenCode AI reads the command
  → Calls the autoskills tool
  → Tool responds: "run npx autoskills"
  → AI uses bash → autoskills TUI opens
  → You pick your skills interactively
  → Skills installed to .agents/skills/
  → OpenCode discovers them automatically
```

**Zero agent tokens consumed during detection, selection, or installation.** The AI only handles the initial invocation (~200 tokens).

---

## 🚀 Installation

### 1. Setup (one time)

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

```
install skills for this project
```

---

## 📦 Distribution

- **npm**: `opencode-autoskills`
- **GitHub**: this repo

### Requirements

- Node.js >= 22.6.0 (required by autoskills)
- OpenCode with the `@opencode-ai/plugin` peer dependency

---

## 🛡️ Security

- **No `postinstall` scripts** — setup is always explicit, never automatic
- **No runtime dependencies** — only `@opencode-ai/plugin` as a peer dependency
- **No file system writes outside intended paths** — path traversal prevention in setup CLI
- **Explicit OpenCode registration** — setup writes the command file and adds the plugin to `opencode.json`
- **autoskills' own security model** applies to all skill downloads (SHA-256 verification, curated registry)

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

## 🙏 Acknowledgments

This project is built on top of [**midudev/autoskills**](https://github.com/midudev/autoskills). All technology detection, skill mapping, registry management, and installation logic comes from autoskills. We only provide the OpenCode integration layer.

If you find this useful, consider:

- ⭐ Starring [autoskills on GitHub](https://github.com/midudev/autoskills)
- 💙 [Sponsoring midudev](https://github.com/sponsors/midudev)
- ⭐ Starring this repo too!

---

## 📄 License

[CC BY-NC 4.0](LICENSE) — same license as [autoskills](https://github.com/midudev/autoskills).  
