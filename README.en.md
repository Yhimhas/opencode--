# OpenCode Workspace (Restored)

## Development Statement (Recommended)

```text
This project is not built by the OpenCode team and is not affiliated with OpenCode.
```

```text
本项目并非由 OpenCode 团队开发，且与 OpenCode 官方不存在隶属关系。
```

This directory is the local OpenCode workspace entrypoint, containing the main source tree and harness assets.  
For development in Cursor, open `opencode-src-fresh` directly.

## Directory Layout

- `opencode-src-fresh`: main source repository (primary development area)
- `opencode-harness-kit`: harness bundle (rules, skills, MCP policies, guardrails)
- `scripts/integrate-into-opencode.mjs`: integrates harness assets into a target source tree

## Quick Start

From this directory:

```powershell
cd D:\opencode--
npm install
```

Integrate harness assets (default target: `.\opencode-src-fresh\.opencode\`):

```powershell
node .\scripts\integrate-into-opencode.mjs
```

Specify an explicit target source directory:

```powershell
$env:OPENCODE_SRC = "D:\opencode--\opencode-src-fresh"
node .\scripts\integrate-into-opencode.mjs
```

## Common Commands

```powershell
# Validate harness configuration completeness
npm run harness:validate

# Equivalent direct script
node .\opencode-harness-kit\scripts\validate-all.mjs

# Run harness automation tests
npm run harness:test

# Run harness lint checks
npm run harness:lint

# Verify formatting rules
npm run harness:format:check

# Local equivalent of CI gates
npm run harness:ci
```

## Harness Integration and Dry Run

Preflight only (no file writes):

```powershell
node .\scripts\integrate-into-opencode.mjs --dry-run
```

Configurable environment variables:

- `OPENCODE_SRC`: target source directory (default `.\opencode-src-fresh`)
- `HARNESS_SCHEMA_URL`: schema URL used when initializing `opencode.jsonc`
- `HARNESS_CONFIG_PATH`: config path used by `check-glm-provider`
- `HARNESS_MCP_POLICY_PATH`: policy path used by `check-mcp-policy`
- `HARNESS_GLM_NPM_KEYWORD`: required keyword in `glm.npm` (default `openai-compatible`)
- `HARNESS_GLM_BASEURL_KEYWORD`: required keyword in `glm.options.baseURL` (default `bigmodel.cn`)

## Error Codes and Troubleshooting

Common error codes and suggested actions:

- `E_FILE_MISSING`: required file is missing; verify path/env variables
- `E_FILE_READ`: file cannot be read; verify permissions and file state
- `E_JSON_PARSE`: invalid JSON/JSONC; check comments/trailing commas/syntax
- `E_GLM_NPM`: `glm.npm` does not match policy keyword
- `E_GLM_BASEURL`: `glm.options.baseURL` does not match policy keyword
- `E_POLICY_DEFAULT_MODE`: `defaultMode` must be `deny`
- `E_POLICY_SERVERS`: `servers` must be an object
- `E_POLICY_SERVER_ITEM`: `servers.<name>` must be an object
- `E_POLICY_ENABLED`: `servers.<name>.enabled` must be boolean
- `E_POLICY_TOOLS_ALLOW`: `servers.<name>.toolsAllow` must be a non-empty string array
- `E_POLICY_TIMEOUT`: `servers.<name>.timeoutMs` must be an integer in `1000~120000`

## Doctor Health Checks (run in main source directory)

```powershell
cd D:\opencode--\opencode-src-fresh

# Human-readable diagnostics
opencode doctor

# CI-friendly machine-readable output
opencode doctor --json --quiet

# Strict gate (fails on any warnings/recommendations)
opencode doctor --json --quiet --strict
```

## Secrets and Security

- Local credential file: `%USERPROFILE%\.local\share\opencode\auth.json`
- Never commit secrets, tokens, or local credential files to git
- Run `git status` before committing to avoid accidental leaks

## Contribution and Documentation Alignment

- When documenting OpenCode behavior, commands, or configuration, align with official docs: [https://opencode.ai/docs](https://opencode.ai/docs)
- Before publishing externally, keep both the development statement and secret-handling notes in your README
