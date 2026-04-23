import { readFileSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const path = join(__dirname, "..", "mcp", "servers.json")

if (!existsSync(path)) {
  console.error("missing", path)
  process.exit(1)
}

const j = JSON.parse(readFileSync(path, "utf8"))
if (j.defaultMode !== "deny") {
  console.error("defaultMode must be deny")
  process.exit(1)
}
console.log("MCP policy OK")
