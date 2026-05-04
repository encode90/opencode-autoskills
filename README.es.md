# opencode-autoskills

> **Plugin de OpenCode creado por encode90 para ahorrarte tiempo al detectar, elegir e instalar skills de IA desde un solo comando.**

Una sola configuración. Escribís `/autoskills`. Elegís con lenguaje natural. Seguís trabajando sin perder tiempo.

---

## ⚡ Por qué existe este proyecto

`opencode-autoskills` convierte una tarea repetitiva de setup en un flujo rápido dentro de OpenCode:

- detecta el stack
- muestra las skills sugeridas
- te deja elegir qué conservar
- instala todo en `.agents/skills/`

El resultado: **menos configuración manual, menos cambios de contexto y más velocidad para arrancar el proyecto actual.**

---

## 🧠 Cómo funciona

```
/autoskills
  → OpenCode invoca la herramienta autoskills
  → La herramienta ejecuta una detección real en modo dry-run
  → Elegís qué querés conservar
  → Podés responder con lenguaje natural o con números
  → La herramienta instala y filtra el resultado final
  → Se instalan en .agents/skills/
  → OpenCode las descubre automáticamente
```

Ejemplos de respuestas válidas después de la detección:

```text
instalá 1, 3, 4
```

```text
dejá vitest, typescript-advanced-types y accessibility
```

```text
todas menos la 2
```

---

## 🚀 Instalación

## Camino rápido

### 1. Setup una vez

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

```text
instalame skills para este proyecto
```

Cuando aparezca la lista, podés responder de cualquiera de estas formas:

```text
dejá 1, 3, 4, 6
```

```text
dejá vitest, accessibility y seo
```

---

## 📦 Distribución

- **Landing page**: https://encode90.github.io/opencode-autoskills/
- **npm**: `opencode-autoskills`
- **GitHub**: este repo

### Requisitos

- Node.js >= 22.6.0
- OpenCode con la dependencia peer `@opencode-ai/plugin`

---

## 🛡️ Seguridad

- **Sin scripts `postinstall`** — el setup siempre es explícito, nunca automático
- **Cero dependencias en runtime** — solo `@opencode-ai/plugin` como peer dependency
- **Sin escrituras fuera de los paths esperados** — prevención de path traversal en el CLI de setup
- **Registro explícito en OpenCode** — setup escribe el archivo de comando y agrega el plugin a `opencode.json`, o crea un wrapper local para modo proyecto
- **Ejecución real** — la herramienta personalizada hace la detección e instalación en lugar de devolver solo instrucciones

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

## 🙏 Crédito

Este proyecto integra [autoskills](https://github.com/midudev/autoskills) dentro de OpenCode. El proyecto upstream aporta el motor de detección e instalación; `opencode-autoskills` se enfoca en el flujo de OpenCode, el setup local por proyecto y la selección pensada para ahorrar tiempo.

---

## 📄 Licencia

[CC BY-NC 4.0](LICENSE) — la misma licencia que [autoskills](https://github.com/midudev/autoskills).  
