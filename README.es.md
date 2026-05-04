# opencode-autoskills

> **Plugin de OpenCode que integra [autoskills](https://github.com/midudev/autoskills) en tu flujo de trabajo con IA.**

Una sola configuración. Escribe `/autoskills`. Tu agente de IA instala las mejores skills para tu stack.

---

## ⚡ Funciona gracias a autoskills

**Este proyecto es un wrapper fino de [midudev/autoskills](https://github.com/midudev/autoskills)** — el motor que escanea tu proyecto, detecta tecnologías e instala skills curadas para agentes de IA.

No mantenemos un catálogo de skills. No escribimos lógica de detección. **autoskills hace todo el trabajo pesado.** Nosotros solo lo hacemos descubrible y sin fricción dentro de OpenCode.

> 💙 Muchísimas gracias a [**midudev**](https://midu.dev) por crear y mantener [autoskills](https://autoskills.sh). Este proyecto no existiría sin él.

---

## 🧠 Cómo funciona

```
/autoskills
  → La IA de OpenCode lee el comando
  → Invoca la herramienta autoskills
  → La herramienta responde: "ejecutá npx autoskills"
  → La IA usa bash → se abre la TUI de autoskills
  → Elegís las skills interactivamente
  → Se instalan en .agents/skills/
  → OpenCode las descubre automáticamente
```

**Cero tokens del agente consumidos durante la detección, selección o instalación.** La IA solo maneja la invocación inicial (~200 tokens).

---

## 🚀 Instalación

### 1. Setup (una sola vez)

```bash
npx opencode-autoskills setup
```

Esto registra el comando `/autoskills` de forma global (`~/.config/opencode/commands/`).
También agrega `opencode-autoskills` al arreglo global de plugins de OpenCode (`~/.config/opencode/opencode.json`) para que la herramienta personalizada esté disponible.

Para instalación por proyecto:

```bash
npx opencode-autoskills setup --local
```

### 2. Usalo

Abrí OpenCode en cualquier proyecto y escribí:

```
/autoskills
```

O simplemente decile a la IA:

```
instalame skills para este proyecto
```

---

## 📦 Distribución

- **npm**: `opencode-autoskills`
- **GitHub**: este repo

### Requisitos

- Node.js >= 22.6.0 (requerido por autoskills)
- OpenCode con la dependencia peer `@opencode-ai/plugin`

---

## 🛡️ Seguridad

- **Sin scripts `postinstall`** — el setup siempre es explícito, nunca automático
- **Cero dependencias en runtime** — solo `@opencode-ai/plugin` como peer dependency
- **Sin escrituras fuera de los paths esperados** — prevención de path traversal en el CLI de setup
- **Registro explícito en OpenCode** — setup escribe el archivo de comando y agrega el plugin a `opencode.json`
- **El modelo de seguridad de autoskills** aplica a todas las descargas de skills (verificación SHA-256, registry curado)

---

## 📁 Estructura del proyecto

```
opencode-autoskills/
├── src/
│   ├── index.ts          # Entry del plugin → exporta la tool autoskills
│   ├── tool.ts           # Definición de la herramienta
│   ├── version.ts        # Validación de versión de Node
│   └── cli.ts            # Lógica del CLI de setup
├── bin/
│   └── setup.mjs         # Entry point del CLI
├── tests/
│   ├── tool.test.ts
│   └── setup-cli.test.ts
└── .github/workflows/
    └── ci.yml            # CI matrix: Win + Mac + Linux
```

---

## 🙏 Agradecimientos

Este proyecto está construido sobre [**midudev/autoskills**](https://github.com/midudev/autoskills). Toda la detección de tecnologías, el mapeo de skills, la gestión del registry y la lógica de instalación viene de autoskills. Nosotros solo aportamos la capa de integración con OpenCode.

Si te sirve este proyecto, considerá:

- ⭐ Darle estrella a [autoskills en GitHub](https://github.com/midudev/autoskills)
- 💙 [Sponsorear a midudev](https://github.com/sponsors/midudev)
- ⭐ ¡Darle estrella a este repo también!

---

## 📄 Licencia

[CC BY-NC 4.0](LICENSE) — la misma licencia que [autoskills](https://github.com/midudev/autoskills).  
