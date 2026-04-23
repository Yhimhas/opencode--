# OpenCode 工作区（恢复版）

## 开发声明（建议使用）

```text
本项目并非由 OpenCode 团队开发，且与 OpenCode 官方不存在隶属关系。
```

```text
This project is not built by the OpenCode team and is not affiliated with OpenCode.
```

这个目录是 OpenCode 的本地工作区入口，包含主源码与 harness 配套资产。  
如果你在 Cursor 中开发，建议直接打开 `opencode-src-fresh`。

## 目录说明

- `opencode-src-fresh`：主源码目录（核心开发区）
- `opencode-harness-kit`：harness 套件（规范、Skills、MCP 策略、守护配置）
- `scripts/integrate-into-opencode.mjs`：将 harness 资产合并到目标源码目录

## 快速开始

在当前目录执行：

```powershell
cd D:\opencode--
npm install
```

合并 harness 资产（默认写入 `.\opencode-src-fresh\.opencode\`）：

```powershell
node .\scripts\integrate-into-opencode.mjs
```

指定目标源码目录：

```powershell
$env:OPENCODE_SRC = "D:\opencode--\opencode-src-fresh"
node .\scripts\integrate-into-opencode.mjs
```

## 常用命令

```powershell
# 校验 harness 配置完整性
npm run harness:validate

# 等价校验命令
node .\opencode-harness-kit\scripts\validate-all.mjs

# 运行 harness 自动化测试
npm run harness:test

# 运行 harness 代码规范检查
npm run harness:lint

# 检查格式是否符合规范
npm run harness:format:check

# 一键执行 CI 本地等价检查
npm run harness:ci
```

## Harness 集成与 dry-run

仅预检查，不写入任何文件：

```powershell
node .\scripts\integrate-into-opencode.mjs --dry-run
```

可配置环境变量（用于可移植性与定制）：

- `OPENCODE_SRC`：目标源码目录（默认 `.\opencode-src-fresh`）
- `HARNESS_SCHEMA_URL`：初始化 `opencode.jsonc` 时使用的 schema URL
- `HARNESS_CONFIG_PATH`：`check-glm-provider` 读取的配置路径
- `HARNESS_MCP_POLICY_PATH`：`check-mcp-policy` 读取的策略路径
- `HARNESS_GLM_NPM_KEYWORD`：`glm.npm` 必须包含的关键字（默认 `openai-compatible`）
- `HARNESS_GLM_BASEURL_KEYWORD`：`glm.options.baseURL` 必须包含的关键字（默认 `bigmodel.cn`）

## 错误码与排障

常见错误码及处理建议：

- `E_FILE_MISSING`：文件不存在，确认路径和环境变量是否正确
- `E_FILE_READ`：文件读取失败，检查权限与文件状态
- `E_JSON_PARSE`：JSON/JSONC 解析失败，检查注释、逗号和语法
- `E_GLM_NPM`：`glm.npm` 未匹配策略关键字，检查 provider 配置
- `E_GLM_BASEURL`：`glm.options.baseURL` 未匹配策略关键字，检查接口地址
- `E_POLICY_DEFAULT_MODE`：`defaultMode` 必须为 `deny`
- `E_POLICY_SERVERS`：`servers` 必须是对象
- `E_POLICY_SERVER_ITEM`：`servers.<name>` 配置项必须是对象
- `E_POLICY_ENABLED`：`servers.<name>.enabled` 必须是布尔值
- `E_POLICY_TOOLS_ALLOW`：`servers.<name>.toolsAllow` 必须是非空字符串数组
- `E_POLICY_TIMEOUT`：`servers.<name>.timeoutMs` 必须是 `1000~120000` 的整数

## Doctor 健康检查（在主源码目录执行）

```powershell
cd D:\opencode--\opencode-src-fresh

# 人类可读诊断
opencode doctor

# CI 机器可读输出（推荐）
opencode doctor --json --quiet

# 严格门禁（有告警即失败）
opencode doctor --json --quiet --strict
```

## 密钥与安全

- 本地凭据文件：`%USERPROFILE%\.local\share\opencode\auth.json`
- 不要将密钥、令牌或凭据文件提交到 git
- 提交前建议检查 `git status`，避免误提交本地配置

## 贡献与文档对齐建议

- 涉及 OpenCode 行为、命令或配置时，优先对齐官方文档：[https://opencode.ai/docs](https://opencode.ai/docs)
- 对外发布前，建议在 README 保留“开发声明”与“凭据不入库”提示
