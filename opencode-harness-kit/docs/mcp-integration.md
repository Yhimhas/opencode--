# MCP 集成策略

1. 默认 **deny**，仅白名单工具可调用。
2. 每个 MCP 设置超时与失败降级（跳过或提示人工）。
3. 远程 MCP 需可审计 URL；生产环境建议关闭实验性服务器。

策略文件：`mcp/servers.json`（由 `check-mcp-policy.mjs` 校验）。
