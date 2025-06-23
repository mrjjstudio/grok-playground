import { handleNotebookLMRequest } from "../src/handle_notebooklm.js";

export const config = {
  runtime: 'edge',
};


// 修改为默认导出
export default async function handler(req) {

    const url = new URL(req.url);
    console.log('Request URL:', req.url);

    // 处理主页面
    const filePath = url.pathname;
    console.log('filePath:', filePath);
    if (filePath === '/' || filePath === '/index.html') {
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
        console.error('Error serving index.html:', error);
        return res.status(500).send('Internal Server Error');
      }
    }   
    //处理notebooklm请求
    return handleNotebookLMRequest(req);
}