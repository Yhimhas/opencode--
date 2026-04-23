import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { fail } from "./lib/common.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = process.env.HARNESS_MCP_POLICY_PATH || join(__dirname, "..", "mcp", "servers.json")

if (!existsSync(path)) {
  fail("E_FILE_MISSING", `策略文件不存在: ${path}`)
}

let j
try {
  j = JSON.parse(readFileSync(path, "utf8"))
} catch (error) {
  fail("E_JSON_PARSE", `策略文件 JSON 无法解析: ${path}`, error)
}

if (j.defaultMode !== "deny") {
  fail("E_POLICY_DEFAULT_MODE", "defaultMode must be deny")
}

if (!j.servers || typeof j.servers !== "object" || Array.isArray(j.servers)) {
  fail("E_POLICY_SERVERS", "servers 必须是对象")
}

for (const [name, cfg] of Object.entries(j.servers)) {
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
    fail("E_POLICY_SERVER_ITEM", `servers.${name} 必须是对象`)
  }
  if (typeof cfg.enabled !== "boolean") {
    fail("E_POLICY_ENABLED", `servers.${name}.enabled 必须是布尔值`)
  }
  if (
    !Array.isArray(cfg.toolsAllow) ||
    cfg.toolsAllow.some((item) => typeof item !== "string" || !item.trim())
  ) {
    fail("E_POLICY_TOOLS_ALLOW", `servers.${name}.toolsAllow 必须是非空字符串数组`)
  }
  if (!Number.isInteger(cfg.timeoutMs) || cfg.timeoutMs < 1000 || cfg.timeoutMs > 120000) {
    fail("E_POLICY_TIMEOUT", `servers.${name}.timeoutMs 必须是 1000~120000 的整数`)
  }
}

console.log("MCP policy OK")
