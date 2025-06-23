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
    }

    // 设置 Cookie
    if (notebookLMCookie) {
        headers.set("Cookie", notebookLMCookie);
    } else {
        // 如果没有 Cookie，返回配置提示
        return new Response(`
            <html>
            <head>
                <title>需要配置 Cookie</title>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; }
                    .btn { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
                </style>
            </head>
            <body>
                <h1>🔧 需要配置 NotebookLM Cookie</h1>
                <div class="warning">
                    <p><strong>检测到您还没有配置 Google 账户的 Cookie。</strong></p>
                    <p>为了使用 NotebookLM 代理服务，您需要先配置有效的 Google 账户 Cookie。</p>
                </div>

                <h3>配置步骤：</h3>
                <ol>
                    <li>访问 <a href="https://notebooklm.google.com" target="_blank">NotebookLM 官网</a> 并登录</li>
                    <li>打开浏览器开发者工具（F12）</li>
                    <li>在 Network 标签中找到请求，复制 Cookie</li>
                    <li>回到管理页面配置 Cookie</li>
                </ol>

                <a href="/admin" class="btn">前往管理页面配置</a>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

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

            // 返回更详细的错误信息
            return new Response(`
                <html>
                <head><title>代理错误</title></head>
                <body>
                    <h1>代理请求失败</h1>
                    <p><strong>状态码:</strong> ${fetchResponse.status}</p>
                    <p><strong>目标URL:</strong> ${targetFullUrl.toString()}</p>
                    <p><strong>错误信息:</strong></p>
                    <pre>${errorText}</pre>
                    <hr>
                    <p>请检查：</p>
                    <ul>
                        <li>Cookie 是否正确配置</li>
                        <li>Google 账户是否有效</li>
                        <li>是否需要重新登录 NotebookLM</li>
                    </ul>
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
