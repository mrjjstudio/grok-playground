const DOMAIN_URL = "https://notebooklm.google.com";
const ASSETS_URL = "https://ssl.gstatic.com";
const GOOGLE_APIS_URL = "https://apis.google.com";
const GOOGLE_ACCOUNTS_URL = "https://accounts.google.com";

export async function handleNotebookLMRequest (req) {

    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    let targetPath;
    let domainUrl = DOMAIN_URL;

    // 处理不同类型的请求
    if (url.pathname.startsWith('/assets') || url.pathname.startsWith('/_/')) {
        // Google 静态资源和内部资源 - 移除 /assets 前缀
        targetPath = url.pathname.replace(/^\/assets/, '');
        domainUrl = ASSETS_URL;
    } else if (url.pathname.startsWith('/apis/')) {
        // Google APIs - 移除 /apis 前缀
        targetPath = url.pathname.replace(/^\/apis/, '');
        domainUrl = GOOGLE_APIS_URL;
    } else if (url.pathname.startsWith('/accounts/')) {
        // Google Accounts - 移除 /accounts 前缀
        targetPath = url.pathname.replace(/^\/accounts/, '');
        domainUrl = GOOGLE_ACCOUNTS_URL;
    } else if (url.pathname.startsWith('/static/') ||
               url.pathname.includes('.js') ||
               url.pathname.includes('.css') ||
               url.pathname.includes('.png') ||
               url.pathname.includes('.jpg') ||
               url.pathname.includes('.svg') ||
               url.pathname.includes('.woff') ||
               url.pathname.includes('.ico') ||
               url.pathname.includes('.webp') ||
               url.pathname.includes('.ttf') ||
               url.pathname.includes('.eot')) {
        // 静态资源文件
        targetPath = url.pathname;
        domainUrl = DOMAIN_URL;
    } else {
        // 所有其他请求都代理到 NotebookLM
        targetPath = url.pathname;
        domainUrl = DOMAIN_URL;
    }

    const targetFullUrl = new URL(targetPath + url.search, domainUrl);
    console.log('Target URL:', targetFullUrl.toString());

    // 构造代理请求 - 更保守的方式
    const headers = new Headers();

    // 从请求的cookie中读取notebooklm_cookie
    let notebookLMCookie = '';
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
        const cookies = cookieHeader.split(';');
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'notebooklm_cookie') {
                notebookLMCookie = decodeURIComponent(value);
                break;
            }
        }
    }

    // 验证 Cookie 格式
    function validateCookie(cookie) {
        if (!cookie) return { valid: false, reason: '未提供 Cookie' };

        // 检查是否包含必要的 Google 认证字段
        const requiredFields = ['__Secure-1PSID', '__Secure-1PSIDTS', '__Secure-1PSIDCC'];
        const hasRequiredField = requiredFields.some(field => cookie.includes(field));

        if (!hasRequiredField) {
            return {
                valid: false,
                reason: `Cookie 缺少必要的认证字段。需要包含以下字段之一: ${requiredFields.join(', ')}`
            };
        }

        // 检查 Cookie 长度（Google Cookie 通常很长）
        if (cookie.length < 100) {
            return {
                valid: false,
                reason: 'Cookie 长度过短，可能不完整'
            };
        }

        return { valid: true, reason: 'Cookie 格式验证通过' };
    }

    // 设置基本的必要请求头
    headers.set("Host", targetFullUrl.host);
    headers.set("User-Agent", req.headers.get("User-Agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // 保留原始的 Accept 头或设置默认值
    headers.set("Accept", req.headers.get("Accept") || "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
    headers.set("Accept-Language", req.headers.get("Accept-Language") || "en-US,en;q=0.9");

    // 不设置 Accept-Encoding，让浏览器自己处理
    if (req.headers.get("Accept-Encoding")) {
        headers.set("Accept-Encoding", req.headers.get("Accept-Encoding"));
    }

    // 设置正确的 Origin 和 Referer
    if (domainUrl === DOMAIN_URL) {
        headers.set("Origin", "https://notebooklm.google.com");
        headers.set("Referer", "https://notebooklm.google.com/");

        // 添加 Google 服务可能需要的额外头
        headers.set("Sec-Fetch-Dest", "document");
        headers.set("Sec-Fetch-Mode", "navigate");
        headers.set("Sec-Fetch-Site", "same-origin");
        headers.set("Sec-Fetch-User", "?1");
        headers.set("Upgrade-Insecure-Requests", "1");

        // 设置更真实的浏览器标识
        if (!req.headers.get("User-Agent")) {
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        }
    }

    // 验证和设置 Cookie
    const cookieValidation = validateCookie(notebookLMCookie);

    if (!cookieValidation.valid) {
        // 返回详细的 Cookie 配置指导
        return new Response(`
            <html>
            <head>
                <title>Cookie 配置问题</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 700px; margin: 50px auto; padding: 20px; }
                    .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                    code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
                    pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
                </style>
            </head>
            <body>
                <h1>🔧 Cookie 配置问题</h1>

                <div class="error">
                    <h3>❌ 检测到的问题：</h3>
                    <p><strong>${cookieValidation.reason}</strong></p>
                </div>

                <div class="info">
                    <h3>📋 正确的 Cookie 获取步骤：</h3>
                    <ol>
                        <li><strong>登录 NotebookLM</strong>：访问 <a href="https://notebooklm.google.com" target="_blank">https://notebooklm.google.com</a> 并完成登录</li>
                        <li><strong>打开开发者工具</strong>：按 F12 或右键选择"检查"</li>
                        <li><strong>切换到 Network 标签</strong>：在开发者工具中找到"Network"或"网络"标签</li>
                        <li><strong>刷新页面</strong>：按 Ctrl+R 或 F5 刷新页面</li>
                        <li><strong>找到主请求</strong>：在请求列表中找到对 <code>notebooklm.google.com</code> 的第一个请求</li>
                        <li><strong>复制 Cookie</strong>：点击该请求，在右侧查看"Headers"，找到"Request Headers"中的"Cookie"字段</li>
                        <li><strong>复制完整内容</strong>：复制整个 Cookie 值（通常很长，包含多个字段）</li>
                    </ol>
                </div>

                <div class="warning">
                    <h3>⚠️ 重要提醒：</h3>
                    <ul>
                        <li>确保复制的是 <strong>完整的 Cookie</strong>，不要遗漏任何部分</li>
                        <li>Cookie 应该包含 <code>__Secure-1PSID</code>、<code>__Secure-1PSIDTS</code> 等字段</li>
                        <li>如果 Cookie 很短（少于100字符），可能是复制不完整</li>
                        <li>确保在登录状态下获取 Cookie</li>
                    </ul>
                </div>

                <a href="/admin" class="btn">返回管理页面重新配置</a>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    // 设置验证通过的 Cookie
    headers.set("Cookie", notebookLMCookie);

    // 保留一些重要的请求头
    const importantHeaders = ['Content-Type', 'Content-Length', 'Authorization'];
    importantHeaders.forEach(headerName => {
        const value = req.headers.get(headerName);
        if (value) {
            headers.set(headerName, value);
        }
    });


    // 调试信息
    console.log('Target URL:', targetFullUrl.toString());
    console.log('Request Method:', req.method);
    console.log('Has Cookie:', !!notebookLMCookie);
    console.log('Cookie Length:', notebookLMCookie ? notebookLMCookie.length : 0);
    console.log('Cookie Validation:', cookieValidation);

    // 显示 Cookie 的前50个字符（用于调试，不泄露完整信息）
    if (notebookLMCookie) {
        console.log('Cookie Preview:', notebookLMCookie.substring(0, 50) + '...');

        // 检查关键字段
        const keyFields = ['__Secure-1PSID', '__Secure-1PSIDTS', '__Secure-1PSIDCC', 'SAPISID', 'APISID'];
        const foundFields = keyFields.filter(field => notebookLMCookie.includes(field));
        console.log('Found Key Fields:', foundFields);
    }

    try {
        const fetchResponse = await fetch(targetFullUrl.toString(), {
            method: req.method,
            headers,
            body: req.body,
            redirect: "manual",
        });

        console.log('Response Status:', fetchResponse.status);
        console.log('Response Headers:', Object.fromEntries(fetchResponse.headers.entries()));

        // 如果是错误状态，记录更多信息
        if (fetchResponse.status >= 400) {
            const errorText = await fetchResponse.text();
            console.error('Error Response Body:', errorText);

            // 分析错误类型
            let errorAnalysis = '';
            let suggestions = [];

            if (fetchResponse.status === 400) {
                errorAnalysis = 'Bad Request - 请求格式错误';
                suggestions = [
                    'Cookie 格式可能不正确',
                    '请确保复制了完整的 Cookie',
                    '检查 Cookie 是否包含必要的认证字段',
                    '尝试重新登录 NotebookLM 获取新的 Cookie'
                ];
            } else if (fetchResponse.status === 401) {
                errorAnalysis = 'Unauthorized - 认证失败';
                suggestions = [
                    'Cookie 可能已过期',
                    '请重新登录 Google 账户',
                    '确保使用的是有效的 Google 账户',
                    '检查账户是否有 NotebookLM 访问权限'
                ];
            } else if (fetchResponse.status === 403) {
                errorAnalysis = 'Forbidden - 访问被拒绝';
                suggestions = [
                    'IP 地址可能被限制',
                    'Google 账户可能被暂时限制',
                    '尝试稍后再试',
                    '考虑使用不同的部署位置'
                ];
            } else {
                errorAnalysis = `HTTP ${fetchResponse.status} 错误`;
                suggestions = [
                    '检查网络连接',
                    '确认 Google 服务状态',
                    '查看详细错误信息'
                ];
            }

            // 返回更详细的错误信息
            return new Response(`
                <html>
                <head>
                    <title>代理错误 - ${fetchResponse.status}</title>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                        .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .suggestions { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .debug { background: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 5px 0 0; }
                        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; }
                        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
                    </style>
                </head>
                <body>
                    <h1>🚨 代理请求失败</h1>

                    <div class="error">
                        <h3>错误详情：</h3>
                        <p><strong>状态码:</strong> ${fetchResponse.status}</p>
                        <p><strong>错误类型:</strong> ${errorAnalysis}</p>
                        <p><strong>目标URL:</strong> <code>${targetFullUrl.toString()}</code></p>
                    </div>

                    <div class="suggestions">
                        <h3>💡 解决建议：</h3>
                        <ul>
                            ${suggestions.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>

                    <div class="debug">
                        <h3>🔍 调试信息：</h3>
                        <p><strong>Cookie 长度:</strong> ${notebookLMCookie ? notebookLMCookie.length : 0} 字符</p>
                        <p><strong>Cookie 验证:</strong> ${cookieValidation.reason}</p>
                        <details>
                            <summary>详细错误响应</summary>
                            <pre>${errorText}</pre>
                        </details>
                    </div>

                    <a href="/admin" class="btn">重新配置 Cookie</a>
                    <a href="https://notebooklm.google.com" target="_blank" class="btn" style="background: #28a745;">前往 NotebookLM 登录</a>
                </body>
                </html>
            `, {
                status: fetchResponse.status,
                headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
        }

        const responseHeaders = new Headers(fetchResponse.headers);
        responseHeaders.delete("Content-Length");

        // 处理重定向
        if (fetchResponse.status >= 300 && fetchResponse.status < 400) {
            const location = responseHeaders.get('Location');
            if (location) {
                const serverOrigin = new URL(req.url).origin;
                let newLocation = location;

                // 重写重定向链接
                if (location.includes('notebooklm.google.com')) {
                    newLocation = location.replace('https://notebooklm.google.com', serverOrigin);
                } else if (location.includes('ssl.gstatic.com')) {
                    newLocation = location.replace('https://ssl.gstatic.com', serverOrigin + '/assets');
                } else if (location.includes('accounts.google.com')) {
                    newLocation = location.replace('https://accounts.google.com', serverOrigin + '/accounts');
                }

                responseHeaders.set('Location', newLocation);
            }
        }

        // 替换请求中的部分资源地址
        const textTransformStream = new TransformStream({
        transform: (chunk, controller) => {
            const contentType = responseHeaders.get("Content-Type") || "";
            if (contentType.startsWith("text/") || contentType.includes("json")) {
            let decodedText = new TextDecoder("utf-8").decode(chunk);

            const serverOrigin = new URL(req.url).origin;

            // 替换所有相关链接，让它们通过代理访问
            if (contentType.includes("text/html")) {
                // 替换 NotebookLM 域名为代理域名
                decodedText = decodedText.replaceAll("https://notebooklm.google.com", serverOrigin);
                decodedText = decodedText.replaceAll("notebooklm.google.com", new URL(serverOrigin).host);
                decodedText = decodedText.replaceAll("//notebooklm.google.com", "//" + new URL(serverOrigin).host);

                // 替换 Google 静态资源
                decodedText = decodedText.replaceAll("https://ssl.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://www.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://fonts.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://fonts.googleapis.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("//ssl.gstatic.com", "//" + new URL(serverOrigin).host + "/assets");
                decodedText = decodedText.replaceAll("//www.gstatic.com", "//" + new URL(serverOrigin).host + "/assets");

                // 替换其他 Google 服务链接
                decodedText = decodedText.replaceAll("https://accounts.google.com", serverOrigin + "/accounts");
                decodedText = decodedText.replaceAll("https://apis.google.com", serverOrigin + "/apis");
                decodedText = decodedText.replaceAll("//accounts.google.com", "//" + new URL(serverOrigin).host + "/accounts");
                decodedText = decodedText.replaceAll("//apis.google.com", "//" + new URL(serverOrigin).host + "/apis");
            }

            // 处理 JSON 响应中的链接
            if (contentType.includes("json")) {
                decodedText = decodedText.replaceAll("https://notebooklm.google.com", serverOrigin);
                decodedText = decodedText.replaceAll("https://ssl.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://www.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://accounts.google.com", serverOrigin + "/accounts");
                decodedText = decodedText.replaceAll("https://apis.google.com", serverOrigin + "/apis");
            }

            // 处理 JavaScript 中的链接
            if (contentType.includes("javascript")) {
                decodedText = decodedText.replaceAll("https://notebooklm.google.com", serverOrigin);
                decodedText = decodedText.replaceAll("'notebooklm.google.com'", `'${new URL(serverOrigin).host}'`);
                decodedText = decodedText.replaceAll('"notebooklm.google.com"', `"${new URL(serverOrigin).host}"`);
                decodedText = decodedText.replaceAll("https://ssl.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://accounts.google.com", serverOrigin + "/accounts");
                decodedText = decodedText.replaceAll("https://apis.google.com", serverOrigin + "/apis");
            }

            // 处理 CSS 中的链接
            if (contentType.includes("css")) {
                decodedText = decodedText.replaceAll("https://ssl.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://www.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://fonts.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://fonts.googleapis.com", serverOrigin + "/assets");
            }
            
            controller.enqueue(new TextEncoder().encode(decodedText));
            } else {
            controller.enqueue(chunk);
            }
        }
        });

        const transformedStream = fetchResponse.body?.pipeThrough(textTransformStream);

        return new Response(transformedStream, {
        status: fetchResponse.status,
        headers: responseHeaders,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Proxy Error:', error);
        console.error('Target URL:', targetFullUrl.toString());
        console.error('Request Method:', req.method);

        return new Response(`
            <html>
            <head><title>代理连接错误</title></head>
            <body>
                <h1>代理连接失败</h1>
                <p><strong>错误信息:</strong> ${errorMessage}</p>
                <p><strong>目标URL:</strong> ${targetFullUrl.toString()}</p>
                <p><strong>请求方法:</strong> ${req.method}</p>
                <hr>
                <p>可能的原因：</p>
                <ul>
                    <li>网络连接问题</li>
                    <li>目标服务器不可达</li>
                    <li>请求超时</li>
                    <li>SSL/TLS 证书问题</li>
                </ul>
                <p><a href="/admin">返回管理页面</a></p>
            </body>
            </html>
        `, {
            status: 500,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

}
