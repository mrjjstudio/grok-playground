  import { handleNotebookLMRequest } from "../handle_notebooklm.js";

  export default async(req, context) => {
    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    const filePath = url.pathname;
    console.log('filePath:', filePath);

    // 处理管理页面 - 用于配置 Cookie
    if (filePath === '/admin' || filePath === '/admin/' || filePath === '/admin/index.html') {
        return context.rewrite('/static/index.html');
    }

    // 处理帮助图片
    if (filePath === '/how_to_get_cookie.png') {
      return context.rewrite('/static/how_to_get_cookie.png');
    }

    // 所有其他请求都代理到 NotebookLM
    return handleNotebookLMRequest(req);
  }

  export const config = {
    path: "/*"
  };