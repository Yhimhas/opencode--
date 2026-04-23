/**
 * 将 opencode-harness-kit 合并进目标 OpenCode 仓库的 .opencode/ 目录。
 * 默认目标：环境变量 OPENCODE_SRC，否则为与本脚本同级的 opencode-src-fresh。
 */
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { fail, parseJsonFile } from "../opencode-harness-kit/scripts/lib/common.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = resolve(__dirname, "..")
const kitRoot = join(workspaceRoot, "opencode-harness-kit")
const targetRoot = resolve(process.env.OPENCODE_SRC || join(workspaceRoot, "opencode-src-fresh"))
const targetOpen = join(targetRoot, ".opencode")
const dryRun = process.argv.includes("--dry-run")
const schemaUrl = process.env.HARNESS_SCHEMA_URL || "https://opencode.ai/config.json"

function deepMerge(base, patch) {
  if (patch === null || patch === undefined) return base
  if (Array.isArray(patch)) return patch.slice()
  if (typeof patch !== "object") return patch
  const out = { ...base }
  for (const [k, v] of Object.entries(patch)) {
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof out[k] === "object" &&
      out[k] !== null &&
      !Array.isArray(out[k])
    ) {
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
if (dryRun) console.log("[integrate] mode = dry-run")

if (!existsSync(kitRoot)) {
  fail("E_KIT_MISSING", "[integrate] missing opencode-harness-kit/")
}
if (!existsSync(targetRoot)) {
  fail("E_TARGET_MISSING", `[integrate] target repo not found: ${targetRoot}`)
}

if (!dryRun) {
  mkdirSync(targetOpen, { recursive: true })
}

if (!dryRun) {
  copyDir(join(kitRoot, "docs"), join(targetOpen, "harness-docs"))
  copyDir(join(kitRoot, "skills"), join(targetOpen, "harness-skills"))
  copyDir(join(kitRoot, "mcp"), join(targetOpen, "harness-mcp"))
  copyDir(join(kitRoot, "guardrails"), join(targetOpen, "harness-guardrails"))
}

const patchPath = join(kitRoot, "export", "harness.patch.json")
const configPath = join(targetOpen, "opencode.jsonc")

let merged
if (existsSync(configPath)) {
  merged = parseJsonFile(configPath, { jsonc: true, label: "目标 opencode.jsonc" })
} else {
  merged = { $schema: schemaUrl }
}

if (existsSync(patchPath)) {
  const patch = parseJsonFile(patchPath, { label: "harness patch" })
  merged = deepMerge(merged, patch)
}

if (!dryRun) {
  writeFileSync(configPath, JSON.stringify(merged, null, 2) + "\n", "utf8")
  console.log("[integrate] wrote", configPath)
  console.log("[integrate] done (docs/skills/mcp/guardrails copied under .opencode/harness-*)")
} else {
  console.log("[integrate] dry-run done (未写入文件)")
}
