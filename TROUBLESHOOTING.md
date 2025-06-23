# NotebookLM 代理故障排除指南

## 常见错误及解决方案

### 1. 400 错误 - "The server cannot process the request because it is malformed"

**原因分析：**
- 请求头格式不正确
- Cookie 格式有问题
- Origin 或 Referer 头缺失或错误

**解决方案：**
1. **检查 Cookie 配置**
   - 确保 Cookie 是从 https://notebooklm.google.com 获取的最新版本
   - Cookie 应该包含完整的认证信息（长度通常超过 500 字符）
   - 必须包含必要字段：`__Secure-1PSID`、`__Secure-1PSIDTS`、`__Secure-1PSIDCC`
   - 避免复制时包含额外的空格或换行符

2. **重新获取 Cookie**
   ```
   1. 清除浏览器缓存
   2. 重新登录 https://notebooklm.google.com
   3. 打开开发者工具 (F12)
   4. 在 Network 标签中刷新页面
   5. 找到对 notebooklm.google.com 的请求
   6. 复制完整的 Cookie 头
   ```

3. **使用 Cookie 验证工具**
   - 访问 `/admin` 管理页面
   - 粘贴 Cookie 后查看验证结果
   - 绿色 ✅ 表示格式正确
   - 红色 ❌ 或黄色 ⚠️ 表示需要重新获取

4. **检查代理配置**
   - 确保选择了正确的账户
   - 验证 Cookie 包含所有必要字段

### 2. 403 错误 - "Forbidden"

**原因：**
- Cookie 已过期
- Google 账户被限制
- IP 地址被封禁

**解决方案：**
1. 重新登录 Google 账户
2. 更新 Cookie 配置
3. 尝试使用不同的 IP 地址部署

### 3. 无法访问管理页面

**解决方案：**
- 确保访问 `https://your-domain.com/admin`
- 检查部署是否成功
- 查看部署平台的日志

### 4. 静态资源加载失败

**原因：**
- 链接重写不完整
- 资源代理路径错误

**解决方案：**
1. 检查浏览器控制台的网络请求
2. 确保所有资源请求都通过代理
3. 检查 `/assets/*` 路径是否正常工作

### 5. 登录循环或重定向问题

**原因：**
- 重定向处理不正确
- Cookie 域名不匹配

**解决方案：**
1. 清除浏览器 Cookie 和缓存
2. 重新配置代理 Cookie
3. 检查重定向链接是否正确重写

## 调试步骤

### 1. 检查代理状态
```
1. 访问 https://your-domain.com/admin
2. 确认 Cookie 已配置且选中
3. 点击 "前往 NotebookLM" 测试
```

### 2. 查看详细错误信息
- 打开浏览器开发者工具
- 查看 Console 标签的错误信息
- 查看 Network 标签的请求状态

### 3. 检查服务器日志
- Netlify: 查看 Functions 日志
- Vercel: 查看 Function 日志
- Cloudflare: 查看 Worker 日志
- Deno: 查看控制台输出

### 4. 测试不同路径
```
- https://your-domain.com/ (主页)
- https://your-domain.com/admin (管理页面)
- https://your-domain.com/assets/... (静态资源)
```

## Cookie 获取详细步骤

### Chrome/Edge 浏览器
1. 访问 https://notebooklm.google.com 并登录
2. 按 F12 打开开发者工具
3. 切换到 "Network" 标签
4. 刷新页面 (Ctrl+R)
5. 在请求列表中找到 "notebooklm.google.com" 的请求
6. 点击该请求，查看 "Headers" 部分
7. 找到 "Request Headers" 中的 "Cookie" 字段
8. 复制整个 Cookie 值

### Firefox 浏览器
1. 访问 https://notebooklm.google.com 并登录
2. 按 F12 打开开发者工具
3. 切换到 "网络" 标签
4. 刷新页面 (Ctrl+R)
5. 在请求列表中找到主请求
6. 在右侧面板查看 "请求头"
7. 复制 "Cookie" 字段的值

## 部署平台特定问题

### Netlify
- 确保 Edge Functions 已启用
- 检查构建日志是否有错误
- 确认域名配置正确

### Vercel
- 检查 Serverless Functions 配置
- 确认 API 路由正常工作
- 查看 Function 日志

### Cloudflare Workers
- 确认 Worker 已部署并绑定域名
- 检查 Worker 日志
- 确认路由配置正确

### Deno Deploy
- 确认入口文件路径正确
- 检查环境变量配置
- 查看部署日志

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：
1. 错误的具体信息和截图
2. 使用的部署平台
3. 浏览器类型和版本
4. 代理域名（如果可以公开）
5. 服务器日志（去除敏感信息）

## 安全提醒

⚠️ **重要提醒：**
- 不要在公共场所或不安全的网络环境下配置 Cookie
- 定期更新 Cookie，特别是在重新登录后
- 不要与他人分享您的 Cookie 信息
- 如果怀疑 Cookie 泄露，立即重新登录并更新配置
