import { handleNotebookLMRequest } from "./handle_notebooklm.js";

export default {

  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    const filePath = url.pathname;
    console.log('filePath:', filePath);

    // 处理管理页面 - 用于配置 Cookie
    if (filePath === '/admin' || filePath === '/admin/' || filePath === '/admin/index.html') {
        console.log('Serving admin page');
        return new Response(await env.__STATIC_CONTENT.get('index.html'), {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
    }

    // 处理帮助图片
    if (filePath === '/how_to_get_cookie.png') {
        return new Response(await env.__STATIC_CONTENT.get('how_to_get_cookie.png'), {
        headers: {
          'content-type': 'image/png',
        },
      });
    }

    // 所有其他请求都代理到 NotebookLM
    return handleNotebookLMRequest(req);
  }
};