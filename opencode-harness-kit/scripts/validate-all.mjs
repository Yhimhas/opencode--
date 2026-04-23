import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

function run(name, file) {
  const r = spawnSync(process.execPath, [join(root, "scripts", file)], { stdio: "inherit" })
  if (r.status !== 0) {
    console.error("failed:", name)
    process.exit(r.status ?? 1)
  }
}

run("check-glm", "check-glm-provider.mjs")
run("check-mcp", "check-mcp-policy.mjs")
console.log("validate-all: OK")
