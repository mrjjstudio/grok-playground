  import { handleNotebookLMRequest } from "../handle_notebooklm.js";

  export default async(req, context) => {
    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    // 处理主页面
    const filePath = url.pathname;
    console.log('filePath:', filePath);
    if (filePath === '/' || filePath === '/index.html') {
        return context.rewrite('/static/index.html');
    }
    if ( filePath === '/how_to_get_cookie.png') {
      return context.rewrite('/static/how_to_get_cookie.png');
  }
    
    //处理notebooklm请求
    return handleNotebookLMRequest(req);
  }

  export const config = {
    path: "/*"
  };