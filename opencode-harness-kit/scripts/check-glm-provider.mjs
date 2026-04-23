import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { fail, parseJsonFile } from "./lib/common.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const cfgPath = process.env.HARNESS_CONFIG_PATH || join(__dirname, "..", "config", "opencode.jsonc")
const npmKeyword = process.env.HARNESS_GLM_NPM_KEYWORD || "openai-compatible"
const baseUrlKeyword = process.env.HARNESS_GLM_BASEURL_KEYWORD || "bigmodel.cn"

if (!existsSync(cfgPath)) {
  fail("E_FILE_MISSING", `配置文件不存在: ${cfgPath}`)
}

const cfg = parseJsonFile(cfgPath, { jsonc: true, label: "opencode 配置" })
const glm = cfg.provider?.glm
if (!glm?.npm?.includes(npmKeyword)) {
  fail("E_GLM_NPM", "glm provider npm mismatch")
}
if (!glm?.options?.baseURL?.includes(baseUrlKeyword)) {
  fail("E_GLM_BASEURL", "glm baseURL missing")
}
console.log("GLM provider config OK")
