import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cfgPath = join(__dirname, "..", "config", "opencode.jsonc")

function stripComments(s) {
  return s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,(\s*[}\]])/g, "$1")
}

if (!existsSync(cfgPath)) {
  console.error("missing", cfgPath)
  process.exit(1)
}

const cfg = JSON.parse(stripComments(readFileSync(cfgPath, "utf8")))
const glm = cfg.provider?.glm
if (!glm?.npm?.includes("openai-compatible")) {
  console.error("glm provider npm mismatch")
  process.exit(1)
}
if (!glm?.options?.baseURL?.includes("bigmodel.cn")) {
  console.error("glm baseURL missing")
  process.exit(1)
}
console.log("GLM provider config OK")
