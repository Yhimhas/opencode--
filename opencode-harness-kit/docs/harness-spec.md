# OpenCode Harness 规范（净室描述）

## 1. 状态机

`idle -> planning -> executing -> completed | failed | cancelled`

## 2. 错误分类

- `MODEL_TEMPORARY`：可重试（限流、超时、5xx）
- `MODEL_PERMANENT`：不可重试（鉴权、模型不存在、4xx 语义错误）
- `TOOL_BLOCKED`：工具被策略拒绝
- `POLICY_DENIED`：权限/策略拒绝

## 3. 权限门控

- `low`：只读、文档、建议
- `medium`：小范围编辑、单文件补丁
- `high`：批量改动、执行命令、网络外呼（需显式确认）

## 4. 事件审计

每次状态迁移应记录：`timestamp`、`phase`、`agent`、`modelID`、`errorClass`（如有）、`tool`（如有）。
