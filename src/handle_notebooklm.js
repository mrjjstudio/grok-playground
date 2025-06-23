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

    // 构造代理请求
    const headers = new Headers(req.headers);
    headers.set("Host", targetFullUrl.host);


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

    //实际用这个cookie请求notebooklm
    headers.set("cookie", notebookLMCookie || '');

    // 设置必要的Google服务请求头
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
    headers.set("Accept-Language", "en-US,en;q=0.5");
    headers.set("Accept-Encoding", "gzip, deflate, br");
    headers.set("DNT", "1");
    headers.set("Connection", "keep-alive");
    headers.set("Upgrade-Insecure-Requests", "1");

    // 删除可能暴露代理的请求头
    headers.delete("Referer");
    headers.delete('CF-Connecting-IP');
    headers.delete('X-Forwarded-For');
    headers.delete('X-Real-IP');
    headers.delete('True-Client-IP');
    headers.delete('x-vercel-deployment-url');
    headers.delete('x-vercel-forwarded-for');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-port');
    headers.delete('x-forwarded-proto');
    headers.delete('x-vercel-id');
    headers.delete('origin');
    headers.delete('baggage');


    //console.log('Request Headers:', headers);

    try {
        const fetchResponse = await fetch(targetFullUrl.toString(), {
        method: req.method,
        headers,
        body: req.body,
        redirect: "manual",
        });

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
        console.error('Proxy Error:', errorMessage);
        return new Response(`Proxy Error: ${errorMessage}`, { status: 500 });
    }

}
