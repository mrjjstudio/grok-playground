const DOMAIN_URL = "https://notebooklm.google.com";
const ASSETS_URL = "https://ssl.gstatic.com";

export async function handleNotebookLMRequest (req) {

    const url = new URL(req.url);
    console.log('Request URL:', req.url);
    
    let targetPath;
    let domainUrl = DOMAIN_URL;
    // 如果是 /notebooklm 路径，移除前缀
    if (url.pathname.startsWith('/notebooklm')) {
        targetPath = url.pathname.replace(/^\/notebooklm/, '');
    // 如果是 /assets 路径，移除前缀，重定到资源站
    } else if (url.pathname.startsWith('/assets')) {
        targetPath = url.pathname.replace(/^\/assets/, '');
        domainUrl = ASSETS_URL
    } else {
        // 其他 直接使用路径（可能是NotebookLM内部请求）
        targetPath = url.pathname;
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

        // 替换请求中的部分资源地址
        const textTransformStream = new TransformStream({
        transform: (chunk, controller) => {
            const contentType = responseHeaders.get("Content-Type") || "";
            if (contentType.startsWith("text/") || contentType.includes("json")) {
            let decodedText = new TextDecoder("utf-8").decode(chunk);

            // 替换Google静态资源链接，让资源请求本地走代理
            if (contentType.includes("text/html")) {
                const serverOrigin = new URL(req.url).origin;
                decodedText = decodedText.replaceAll("https://ssl.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://www.gstatic.com", serverOrigin + "/assets");
                decodedText = decodedText.replaceAll("https://fonts.gstatic.com", serverOrigin + "/assets");
            }
            
            // 处理NotebookLM相关的JSON响应
            if (contentType.includes("json")) {
                // 可能需要根据实际API响应调整
                decodedText = decodedText.replaceAll("https://ssl.gstatic.com", new URL(req.url).origin + "/assets");
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
