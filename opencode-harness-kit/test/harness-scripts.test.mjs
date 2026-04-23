import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync, existsSync } from "node:fs"
import { join, resolve } from "node:path"
import { tmpdir } from "node:os"
import { spawnSync } from "node:child_process"

const workspace = resolve(import.meta.dirname, "..", "..")
const harnessScripts = resolve(workspace, "opencode-harness-kit", "scripts")
const rootScripts = resolve(workspace, "scripts")

function runScript(scriptPath, env = {}, args = []) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, ...env },
  })
}

test("check-glm-provider: valid config passes", () => {
  const dir = mkdtempSync(join(tmpdir(), "harness-glm-ok-"))
  const cfgPath = join(dir, "opencode.jsonc")
  writeFileSync(
    cfgPath,
    JSON.stringify({
      provider: {
        glm: {
          npm: "@ai-sdk/openai-compatible",
          options: { baseURL: "https://open.bigmodel.cn/api/paas/v4" },
        },
      },
    }),
    "utf8"
  )
  const result = runScript(join(harnessScripts, "check-glm-provider.mjs"), {
    HARNESS_CONFIG_PATH: cfgPath,
  })
  assert.equal(result.status, 0)
  assert.match(result.stdout, /GLM provider config OK/)
})

test("check-glm-provider: npm mismatch fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "harness-glm-bad-"))
  const cfgPath = join(dir, "opencode.jsonc")
  writeFileSync(
    cfgPath,
    JSON.stringify({
      provider: {
        glm: {
          npm: "@ai-sdk/openai",
          options: { baseURL: "https://open.bigmodel.cn/api/paas/v4" },
        },
      },
    }),
    "utf8"
  )
  const result = runScript(join(harnessScripts, "check-glm-provider.mjs"), {
    HARNESS_CONFIG_PATH: cfgPath,
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /\[E_GLM_NPM\]/)
})

test("check-mcp-policy: invalid timeout fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "harness-mcp-bad-"))
  const policyPath = join(dir, "servers.json")
  writeFileSync(
    policyPath,
    JSON.stringify({
      version: 1,
      defaultMode: "deny",
      servers: {
        docs: {
          enabled: true,
          toolsAllow: ["fetch_url"],
          timeoutMs: 100,
        },
      },
    }),
    "utf8"
  )
  const result = runScript(join(harnessScripts, "check-mcp-policy.mjs"), {
    HARNESS_MCP_POLICY_PATH: policyPath,
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /\[E_POLICY_TIMEOUT\]/)
})

test("validate-all: all checks pass", () => {
  const dir = mkdtempSync(join(tmpdir(), "harness-all-ok-"))
  const cfgPath = join(dir, "opencode.jsonc")
  const policyPath = join(dir, "servers.json")
  writeFileSync(
    cfgPath,
    JSON.stringify({
      provider: {
        glm: {
          npm: "@ai-sdk/openai-compatible",
          options: { baseURL: "https://open.bigmodel.cn/api/paas/v4" },
        },
      },
    }),
    "utf8"
  )
  writeFileSync(
    policyPath,
    JSON.stringify({
      version: 1,
      defaultMode: "deny",
      servers: {
        docs: {
          enabled: false,
          toolsAllow: ["fetch_url"],
          timeoutMs: 5000,
        },
      },
    }),
    "utf8"
  )
  const result = runScript(join(harnessScripts, "validate-all.mjs"), {
    HARNESS_CONFIG_PATH: cfgPath,
    HARNESS_MCP_POLICY_PATH: policyPath,
  })
  assert.equal(result.status, 0)
  assert.match(result.stdout, /validate-all: OK/)
})

test("integrate: dry-run does not write target", () => {
  const targetRoot = mkdtempSync(join(tmpdir(), "harness-integrate-dry-"))
  const result = runScript(
    join(rootScripts, "integrate-into-opencode.mjs"),
    { OPENCODE_SRC: targetRoot },
    ["--dry-run"]
  )
  assert.equal(result.status, 0)
  assert.match(result.stdout, /dry-run done/)
  assert.equal(existsSync(join(targetRoot, ".opencode", "opencode.jsonc")), false)
})

test("integrate: normal mode writes target config", () => {
  const targetRoot = mkdtempSync(join(tmpdir(), "harness-integrate-real-"))
  const result = runScript(join(rootScripts, "integrate-into-opencode.mjs"), {
    OPENCODE_SRC: targetRoot,
  })
  assert.equal(result.status, 0)
  assert.equal(existsSync(join(targetRoot, ".opencode", "opencode.jsonc")), true)
  assert.equal(existsSync(join(targetRoot, ".opencode", "harness-mcp")), true)
})
