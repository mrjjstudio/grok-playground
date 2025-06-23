import { handleNotebookLMRequest } from "../src/handle_notebooklm.js";

export const config = {
  runtime: 'edge',
};


// 修改为默认导出
export default async function handler(req) {

    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    const filePath = url.pathname;
    console.log('filePath:', filePath);

    // 处理管理页面 - 用于配置 Cookie
    if (filePath === '/admin' || filePath === '/admin/' || filePath === '/admin/index.html') {
      try {
        const indexHtml = await fetch(new URL('../src/static/index.html', import.meta.url))
        .then(res => res.text());
        return new Response(indexHtml, {
            status: 200,
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            }
        });
      } catch (error) {
        console.error('Error serving admin page:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // 处理帮助图片
    if (filePath === '/how_to_get_cookie.png') {
      try {
        const imageResponse = await fetch(new URL('../src/static/how_to_get_cookie.png', import.meta.url));
        return new Response(imageResponse.body, {
            status: 200,
            headers: {
                'content-type': 'image/png',
            }
        });
      } catch (error) {
        console.error('Error serving image:', error);
        return new Response('Image not found', { status: 404 });
      }
    }

    // 所有其他请求都代理到 NotebookLM
    return handleNotebookLMRequest(req);
}