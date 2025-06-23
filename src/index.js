import { handleNotebookLMRequest } from "./handle_notebooklm.js";

export default {

  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    // 处理主页面
    const filePath = url.pathname;
    console.log('filePath:', filePath);
    if (filePath === '/' || filePath === '/index.html') {
        console.log('Serving index.html',env);
        return new Response(await env.__STATIC_CONTENT.get('index.html'), {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
    }
    //处理notebooklm请求
    return handleNotebookLMRequest(req);
  }
};