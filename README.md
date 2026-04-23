# OpenCode 工作区（恢复版）

- **主源码目录**：`opencode-src-fresh`（请用 Cursor 打开此目录进行开发）
- **Harness 套件**：`opencode-harness-kit`（规范、Skills、MCP 策略、守护配置）
- **合并到实仓**：在 `D:\opencode--` 执行：

```powershell
cd D:\opencode--
# 默认合并到 .\opencode-src-fresh\.opencode\
node .\scripts\integrate-into-opencode.mjs

# 或指定目录
$env:OPENCODE_SRC = "D:\opencode--\opencode-src-fresh"
node .\scripts\integrate-into-opencode.mjs
```

- **校验 harness**：`npm run harness:validate` 或 `node opencode-harness-kit/scripts/validate-all.mjs`

密钥请放在 `%USERPROFILE%\.local\share\opencode\auth.json`，勿提交到 git。
