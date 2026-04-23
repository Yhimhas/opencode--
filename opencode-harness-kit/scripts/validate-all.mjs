import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

function run(name, file) {
  const r = spawnSync(process.execPath, [join(root, "scripts", file)], { stdio: "inherit" })
  return { name, ok: r.status === 0, status: r.status ?? 1 }
}

const checks = [
  run("check-glm", "check-glm-provider.mjs"),
  run("check-mcp", "check-mcp-policy.mjs"),
]

const failed = checks.filter((item) => !item.ok)
if (failed.length > 0) {
  console.error("validate-all: failed")
  for (const item of failed) {
    console.error(`- ${item.name} (exit ${item.status})`)
  }
  console.error("hint: 请先修复上述配置问题，再重新运行 npm run harness:validate")
  process.exit(1)
}

console.log("validate-all: OK")
