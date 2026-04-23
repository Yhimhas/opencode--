import { readFileSync } from "node:fs"

export function normalizeJsonc(text) {
  let s = text.replace(/\/\*[\s\S]*?\*\//g, "")
  s = s.replace(/^\s*\/\/.*$/gm, "")
  s = s.replace(/,(\s*[}\]])/g, "$1")
  return s
}

export function parseJsonFile(path, { jsonc = false, label = "file" } = {}) {
  try {
    const raw = readFileSync(path, "utf8")
    return JSON.parse(jsonc ? normalizeJsonc(raw) : raw)
  } catch (error) {
    const code = error?.name === "SyntaxError" ? "E_JSON_PARSE" : "E_FILE_READ"
    fail(code, `${label} 读取失败: ${path}`, error)
  }
}

export function fail(code, message, error) {
  const details = error?.message ? ` (${error.message})` : ""
  console.error(`[${code}] ${message}${details}`)
  process.exit(1)
}
