/**
 * 将 opencode-harness-kit 合并进目标 OpenCode 仓库的 .opencode/ 目录。
 * 默认目标：环境变量 OPENCODE_SRC，否则为与本脚本同级的 opencode-src-fresh。
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = resolve(__dirname, "..")
const kitRoot = join(workspaceRoot, "opencode-harness-kit")
const targetRoot = resolve(process.env.OPENCODE_SRC || join(workspaceRoot, "opencode-src-fresh"))
const targetOpen = join(targetRoot, ".opencode")

function normalizeJsonc(text) {
  let s = text.replace(/\/\*[\s\S]*?\*\//g, "")
  // 只去掉行首 // 注释，避免误伤 https:// 里的 //
  s = s.replace(/^\s*\/\/.*$/gm, "")
  s = s.replace(/,(\s*[}\]])/g, "$1")
  return s
}

function deepMerge(base, patch) {
  if (patch === null || patch === undefined) return base
  if (Array.isArray(patch)) return patch.slice()
  if (typeof patch !== "object") return patch
  const out = { ...base }
  for (const [k, v] of Object.entries(patch)) {
    if (v !== null && typeof v === "object" && !Array.isArray(v) && typeof out[k] === "object" && out[k] !== null && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v)
    } else {
      out[k] = v
    }
  }
  return out
}

function copyDir(src, dest) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  for (const name of readdirSync(src)) {
    const from = join(src, name)
    const to = join(dest, name)
    if (statSync(from).isDirectory()) copyDir(from, to)
    else cpSync(from, to, { force: true })
  }
}

console.log("[integrate] kitRoot =", kitRoot)
console.log("[integrate] targetRoot =", targetRoot)

if (!existsSync(kitRoot)) {
  console.error("[integrate] missing opencode-harness-kit/")
  process.exit(1)
}
if (!existsSync(targetRoot)) {
  console.error("[integrate] target repo not found:", targetRoot)
  process.exit(1)
}

mkdirSync(targetOpen, { recursive: true })

copyDir(join(kitRoot, "docs"), join(targetOpen, "harness-docs"))
copyDir(join(kitRoot, "skills"), join(targetOpen, "harness-skills"))
copyDir(join(kitRoot, "mcp"), join(targetOpen, "harness-mcp"))
copyDir(join(kitRoot, "guardrails"), join(targetOpen, "harness-guardrails"))

const patchPath = join(kitRoot, "export", "harness.patch.json")
const configPath = join(targetOpen, "opencode.jsonc")

let merged
if (existsSync(configPath)) {
  const raw = readFileSync(configPath, "utf8")
  merged = JSON.parse(normalizeJsonc(raw))
} else {
  merged = { $schema: "https://opencode.ai/config.json" }
}

if (existsSync(patchPath)) {
  const patch = JSON.parse(readFileSync(patchPath, "utf8"))
  merged = deepMerge(merged, patch)
}

writeFileSync(configPath, JSON.stringify(merged, null, 2) + "\n", "utf8")
console.log("[integrate] wrote", configPath)
console.log("[integrate] done (docs/skills/mcp/guardrails copied under .opencode/harness-*)")
