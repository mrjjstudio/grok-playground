# NotebookLM 代理使用说明

## 项目概述

本项目是基于原 Grok 游乐场项目修改而来的 NotebookLM 代理服务，可以让您在国内环境下访问 Google NotebookLM。

## 主要修改内容

1. **代理目标更改**：从 `grok.com` 改为 `notebooklm.google.com`
2. **认证机制调整**：适配 Google 账户的 Cookie 认证
3. **前端界面更新**：将所有 Grok 相关内容改为 NotebookLM
4. **路径处理优化**：支持 `/notebooklm` 路径代理

## 使用步骤

### 1. 获取 Google 账户 Cookie

1. 使用 Google 账户登录 [NotebookLM 官方网站](https://notebooklm.google.com)
2. 打开浏览器开发者工具（F12）
3. 切换到 "Network" 标签，刷新页面
4. 找到对 `notebooklm.google.com` 的请求
5. 在请求头中找到 "Cookie" 字段
6. 复制整个 Cookie 值

### 2. 配置代理

1. 访问代理网站首页
2. 点击 "添加新账户"
3. 将复制的 Cookie 粘贴到文本框中
4. 选择该账户

### 3. 开始使用

点击 "📚 点击前往 NotebookLM 页面 📚" 按钮即可开始使用代理服务。

## 技术细节

### 代理路径映射

- `/notebooklm/*` → `https://notebooklm.google.com/*`
- `/assets/*` → `https://ssl.gstatic.com/*`

### 请求头处理

- 自动设置适合 Google 服务的 User-Agent
- 删除可能暴露代理的请求头
- 保持 Google 认证 Cookie

### 响应处理

- 替换静态资源链接，确保资源通过代理加载
- 处理 HTML 和 JSON 响应中的链接重写

## 注意事项

1. **隐私安全**：Google 账户 Cookie 包含敏感信息，请谨慎使用
2. **访问限制**：需要有效的 Google 账户和 NotebookLM 访问权限
3. **IP 限制**：建议使用干净的 IP 部署，避免被 Google 风控
4. **Cookie 有效期**：Google Cookie 可能会过期，需要定期更新

## 部署选项

- **Netlify**：免费，国内可直连
- **Deno Deploy**：免费，性能好
- **Cloudflare Worker**：免费，全球 CDN
- **自建服务器**：最稳定，推荐使用

## 故障排除

1. **无法访问**：检查 Cookie 是否有效
2. **加载缓慢**：尝试更换部署平台
3. **功能异常**：检查网络连接和 Google 账户状态

## 免责声明

本项目仅供学习和研究使用，请遵守相关法律法规和服务条款。
