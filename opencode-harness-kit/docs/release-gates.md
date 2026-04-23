# 发布前检查

- `node opencode-harness-kit/scripts/validate-all.mjs` 通过
- 桌面端：`packages/desktop-electron` 先 `build` 再 `package`，确认 `out/renderer/index.html` 存在
- 关键路径：`run` 模式在非 TTY 下不阻塞 stdin
- 不在仓库中提交 `auth.json` 或真实密钥
