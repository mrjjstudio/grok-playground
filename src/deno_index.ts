import { handleNotebookLMRequest } from "./handle_notebooklm.js";


async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  console.log('Request URL:', req.url);

  const filePath = url.pathname;
  console.log('filePath:', filePath);

  // 处理管理页面 - 用于配置 Cookie
  if (filePath === '/admin' || filePath === '/admin/' || filePath === '/admin/index.html') {
      const fullPath = `${Deno.cwd()}/src/static/index.html`;
      const file = await Deno.readFile(fullPath);
      return new Response(file, {
        headers: {
          'content-type': `text/html;charset=UTF-8`,
        },
      });
  }

  // 处理帮助图片
  if (filePath === '/how_to_get_cookie.png') {
    const fullPath = `${Deno.cwd()}/src/static/how_to_get_cookie.png`;
    const file = await Deno.readFile(fullPath);
    return new Response(file, {
      headers: {
        'content-type': 'image/png',
      },
    });
  }

  // 所有其他请求都代理到 NotebookLM
  return handleNotebookLMRequest(req);

};

Deno.serve({ port: 80 },handleRequest); 